pragma solidity ^0.4.23;
import "./Orders.sol";
import "./Store.sol";

contract Factory {
    
    address public manager;
    mapping(address => bool) public adminStaff;
    mapping(address => bool) public approvedStoreOwner;
    
    uint public refundTime;
    
    Orders orders;
    Store store;
    
    
    address[] public deployedStores;
    string[] public deployedStoreNames;
    
    mapping(address => address) public storeAndOrders;
    mapping(address => address) public storeAndManagers;
    
    modifier restricted() {require(msg.sender == manager,"Check MANAGER"); _;}
    modifier restrictedStaff() {require(adminStaff[msg.sender],"Check STAFF"); _;}
    modifier restrictedOwners() {require(approvedStoreOwner[msg.sender],"Check OWNER"); _;}
    
    constructor (uint _refundTime) public {
        manager = msg.sender;
        adminStaff[msg.sender] = true;
        refundTime = _refundTime;
        
    }
    
   /* ->>>>>>>>>>>>>>>>>>>>>>>>>>>>> */
   /*  Approved Owners               */
   /* ->>>>>>>>>>>>>>>>>>>>>>>>>>>>> */
    function createStore(string _name) public restrictedOwners {
        Store newStore = new Store(_name,msg.sender);
        Orders newOrder = new Orders(msg.sender,refundTime,newStore);
        newStore.setOrderAddress(newOrder);
        newOrder.setStoreAddress(newStore);
        
        deployedStores.push(newStore);
        deployedStoreNames.push(_name);

        storeAndManagers[msg.sender] = newStore;
        storeAndOrders[newStore] = newOrder;
        approvedStoreOwner[msg.sender] = false;
    }
    
   /* ->>>>>>>>>>>>>>>>>>>>>>>>>>>>> */
   /*  Anyone to Create Store        */
   /* ->>>>>>>>>>>>>>>>>>>>>>>>>>>>> */    
    function getDeployedStores() public view returns (address[]) {
        return deployedStores;
    }

    function getOrderFromStore(address _storeAddress) public view returns (address orderAddress) {
        return storeAndOrders[_storeAddress];
    }
   /* ->>>>>>>>>>>>>>>>>>>>>>>>>>>>> */
   /*  Admin only task               */
   /* ->>>>>>>>>>>>>>>>>>>>>>>>>>>>> */
    function resolveDispute(uint _orderId,address _storeAddress,address _winner) 
    public
    restrictedStaff
    {
        address orderAddress = storeAndOrders[_storeAddress];
        Orders(orderAddress).adminResolvesDispute(_orderId,_winner);
        
    }

    function updateStore(address _storeAddress, address _newAddress) 
    public
    restrictedStaff
    {   
        Orders(_storeAddress).setStoreAddress(_newAddress);
        
    }
    
    function updateOrders(address _storeAddress, address _newAddress) 
    public
    restrictedStaff
    {   
        Store(_storeAddress).setOrderAddress(_newAddress);
        
        
    }
    
    function updateFactory(address _storeAddress, address _orderAddress, address _factoryAddress) 
    public
    restrictedStaff
    {   
        Store(_storeAddress).setFactoryAddress(_factoryAddress);
        Orders(_orderAddress).setFactoryAddress(_factoryAddress);
    }

    function updateRefundTime(uint _refundTime) 
    public
    restrictedStaff
    {   
        refundTime = _refundTime;
    }
    
    function addStoreOwner(address _address) public restrictedStaff {
        approvedStoreOwner[_address] = true;
    }
    
    function delStoreOwner(address _address) public restrictedStaff {
        delete approvedStoreOwner[_address];
    }
   
    /* ->>>>>>>>>>>>>>>>>>>>>>>>>>>>> */
    /*  Admin only task               */
    /* ->>>>>>>>>>>>>>>>>>>>>>>>>>>>> */
    function addAdminStaff(address _address) public restricted {
        adminStaff[_address] = true;
    }
   
    function delAdminStaff(address _address) public restricted {
        delete adminStaff[_address];
    }

}