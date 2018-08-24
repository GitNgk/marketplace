pragma solidity ^0.4.17;

contract Orders {

    address public manager;
    address public factoryAddress;
    address public storeAddress;
   
    struct Order {
        uint itemId;
        uint price;
        address buyer;
        string deliver;
        uint quantity;
        uint date;
        State state;
    }

    mapping(address => uint[]) buyersOrders;
    mapping(address => bool) public buyerList;
   
    enum State {Sold,DeliveryAddress,Shipped,Received,Refund,Approved,Rejected,Complete}

    mapping(uint => Order) public orders;
    uint public orderCount;
    uint public refundTime;
   

    /* Event item stages */
    event Sold(uint sku);
    event Shipped(uint sku);
    event Received(uint sku);
    event Refund(uint sku);
    event Approved(uint sku);
    event OrderCreated(uint sku);

    /* Sale timming check */
    modifier onlyBefore(uint _orderId) {require(block.timestamp < orders[_orderId].date,"Check BEFORE time expires"); _;}
    modifier onlyAfter(uint _orderId) {require(block.timestamp > orders[_orderId].date,"Check AFTER time expires"); _;}

    /* Sale status checks */
    modifier sold (uint _orderId) {require(orders[_orderId].state == State.Sold,"Check Item SOLD"); _;}
    modifier deliverInfo (uint _orderId) {require(orders[_orderId].state == State.DeliveryAddress,"Check Item DeliverInfo"); _;}
    modifier shipped (uint _orderId) {require(orders[_orderId].state == State.Shipped,"Check Item SHIPPED"); _;}
    modifier received (uint _orderId) {require(orders[_orderId].state == State.Received,"Check Item RECEIVED"); _;}
    modifier notComplete(uint _orderId) {require(orders[_orderId].state != State.Complete,"Check Item COMPLETE");_;}
    modifier approvedRefund(uint _orderId) {require(orders[_orderId].state == State.Approved,"Check Item APPROVED");_;}

    /* Transaction user checks */
    modifier restricted() {require(msg.sender == manager,"Check is MANAGER"); _;}
    modifier verifyCaller (address _address) {require (msg.sender == _address,"Check ADDRESS"); _;}
    modifier verifyManagerOrBuyer (address _address) {
        require (msg.sender == _address || msg.sender == manager,"Check Manager or Buyers");
        _;
    }


    constructor(address _manager,uint _refundTime,address _storeAddress) public {
        manager = _manager;
        factoryAddress = msg.sender;
        storeAddress = _storeAddress;
        refundTime = _refundTime;
        orderCount = 0;
    }

    function() public payable {
    }
   
    /* ->>>>>>>>>>>>>>>>>>>>>>>>>>>>> */
    /*  Store related tasks           */
    /* ->>>>>>>>>>>>>>>>>>>>>>>>>>>>> */ 
    function createOrder(uint _itemId,uint _price, address _buyer, uint _quantity)
      public
      verifyCaller(storeAddress) 
      returns (uint orderId)
    {
        orders[orderCount] = Order({
            itemId:_itemId,
            price:_price,
            buyer:_buyer,
            deliver:"",
            quantity:_quantity,
            date:block.timestamp,
            state:State.Sold
            });

        buyersOrders[_buyer].push(orderCount);
        buyerList[_buyer] = true;
        emit OrderCreated(orderCount);
        orderCount++;
        return(orderCount-1);
    }

    /* ->>>>>>>>>>>>>>>>>>>>>>>>>>>>> */
    /*  Buyer relates tasks           */
    /* ->>>>>>>>>>>>>>>>>>>>>>>>>>>>> */

    /* Change the state of the item to received and call event! */
    function updateAddress(uint _orderId,string _deliver) public
        sold(_orderId)
        verifyCaller(orders[_orderId].buyer)
    {
        Order storage order = orders[_orderId];
        order.deliver = _deliver;
        order.state = State.DeliveryAddress;
        emit Received(_orderId); 
    }

    function receiveItem(uint _orderId) public
        shipped(_orderId)
        verifyCaller(orders[_orderId].buyer)
    {
        Order storage order = orders[_orderId];
        order.state = State.Received;
        emit Received(_orderId); 
    }

    function requestRefund(uint _orderId) public
        notComplete(_orderId)
        onlyBefore(_orderId) 
        verifyCaller(orders[_orderId].buyer)
    {
        orders[_orderId].state = State.Refund;
        emit Refund(_orderId);
    }
 
    function buyerWithdraws(uint _orderId) public payable 
        verifyCaller(orders[_orderId].buyer)
        approvedRefund(_orderId)
    {
        Order storage order = orders[_orderId];
        order.state = State.Complete;
        msg.sender.transfer(order.price);
    }

    function getOrdersList() public view returns (uint[]) {
        return buyersOrders[msg.sender];
    }

    function fetchOrder(uint _orderId) public view
       verifyManagerOrBuyer(orders[_orderId].buyer)
       returns (
           uint orderId, 
           uint item, 
           uint price,
           string deliver,
           uint quantity,
           uint date,
           State state
        ) 
    {
        Order memory order = orders[_orderId];
        item = order.itemId;
        price = order.price;
        deliver = order.deliver;          
        quantity = order.quantity;
        date = order.date;
        state = order.state;
        return (_orderId,item,price,deliver,quantity,date,state);
    }

    /* ->>>>>>>>>>>>>>>>>>>>>>>>>>>>> */
    /*   Seller related tasks         */
    /* ->>>>>>>>>>>>>>>>>>>>>>>>>>>>> */
   
   
    /*  Change the state of the item to shipped and call event!*/
    function shipItem(uint _orderId) 
        public
        deliverInfo(_orderId)
        restricted
    {
        emit Shipped(_orderId);
        Order storage order = orders[_orderId];
        order.date = block.timestamp + refundTime;
        order.state = State.Shipped;
    }

    function approveRefund (uint _orderId)
        public
        restricted
        notComplete(_orderId)
    { 
        Order storage order = orders[_orderId];
        order.state = State.Approved;
        emit Approved(_orderId);
    }

    function managerGetPaid(uint _orderId) public payable 
        restricted
        onlyAfter(_orderId)
        notComplete(_orderId)
    {
        Order storage order = orders[_orderId];
        require(order.state != State.Refund || order.state != State.Approved,"Check REFUND");
        order.state = State.Complete;
        manager.transfer(order.price);
    }

    /* ->>>>>>>>>>>>>>>>>>>>>>>>>>>>> */
    /* Factory Admin Functions        */ 
    /* ->>>>>>>>>>>>>>>>>>>>>>>>>>>>> */

    function adminResolvesDispute(uint _orderId, address _winner) 
       public
       verifyCaller(factoryAddress) 
       notComplete(_orderId)
    {  
        Order storage order = orders[_orderId];
        if(order.buyer == _winner ){
            order.state = State.Approved;
        } else if (manager == _winner ) {
            order.state = State.Rejected;
        }
    }

    function setStoreAddress(address _storeAddress)
        public 
        verifyCaller(factoryAddress)
        returns (bool)
    {
        storeAddress = _storeAddress;
        return(true);
    }

    function setFactoryAddress(address _factoryAddress)
        public 
        verifyCaller(factoryAddress)
        returns (bool)
    {
        factoryAddress = _factoryAddress;
        return(true);
    }
}