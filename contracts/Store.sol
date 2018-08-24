pragma solidity ^0.4.17;

import "./Auction.sol";
import "./Orders.sol";
import "./SafeMath.sol";

contract Store {
    
    address public manager;
    address public factoryAddress;
    address public orderAddress;
    using SafeMath for uint;  
   
    struct Item {
        uint sku;
        string ipfsHash;
        string name;
        string description;
        uint price;
        address seller;
        address auction;
        uint inventory;
    }

    uint public skuCount;
    Auction public auction;
    mapping(address => uint) public auctionlist;

    string public storeName;
    mapping(uint => Item) public items;

    event ForSale(uint sku);
    event Sold(uint sku);

    modifier restricted() {require(msg.sender == manager,"Check MANAGER"); _;}
    modifier verifyCaller (address _address) {require (msg.sender == _address,"Check ADDRESS"); _;}
    modifier verifyAuction (uint _sku,address _address) {require (auctionlist[_address] == _sku,"Check active AUCTION"); _;}

    modifier forSale (uint _sku,uint _quantity) {require(items[_sku].inventory >= _quantity,"Check AVAILIBILTY"); _;}
    modifier paidEnough(uint _price) {require(msg.value >= _price,"Check VALUE"); _;}
    modifier notAuction(uint _sku){require(items[_sku].auction==address(0x0),"Auction Only");_;}
   
    modifier checkValue(uint _sku,uint _quantity) {
        _;
        uint _price = items[_sku].price;
        uint amountToRefund = msg.value.sub(_price.mul(_quantity));
        msg.sender.transfer(amountToRefund);
    }

    constructor(string _storeName, address _manager) public {
        manager = _manager;
        storeName = _storeName;
        factoryAddress = msg.sender;
        skuCount = 0;
    }

    /* ->>>>>>>>>>>>>>>>>>>>>>>>>>>>> */
    /* Managers only  Functions       */ 
    /* ->>>>>>>>>>>>>>>>>>>>>>>>>>>>> */
    
    function addItem(
        string _name,
        string _ipfsHash,
        string _description,
        uint _price,
        uint _inventory,
        bool _auction,
        uint _time)
        public 
        restricted
    {
        if(_auction){
            auction = new Auction(_time,orderAddress,skuCount,_price);
            auctionlist[auction] = skuCount;
            emit ForSale(skuCount);

            items[skuCount] = Item({
                name: _name,
                ipfsHash: _ipfsHash,
                sku: skuCount,
                description: _description,
                price: _price,
                seller: manager,
                auction: auction,
                inventory: _inventory
                });
        } else{
            emit ForSale(skuCount);
            items[skuCount] = Item({
                name: _name,
                ipfsHash: _ipfsHash,
                sku: skuCount,
                description: _description,
                price: _price,
                seller: manager,
                auction:address(0x0),
                inventory: _inventory
                }); 
        }
        skuCount++;
    }

    function updateItem(
        uint _sku,
        string _name,
        string _ipfsHash,
        string _description,
        uint _price,
        uint _inventory,
        address _auction) 
    public restricted returns (bool) {
        Item storage item = items[_sku];
        item.name = _name;
        item.ipfsHash = _ipfsHash;
        item.description = _description;
        item.price = _price;
        item.inventory = _inventory;
        item.auction = _auction;
        return (true);
    }
     
    /* ->>>>>>>>>>>>>>>>>>>>>>>>>>>>> */
    /* Anyone Can run Functions       */ 
    /* ->>>>>>>>>>>>>>>>>>>>>>>>>>>>> */

    function buyItem(uint _sku, uint _quantity)
        public
        payable
        forSale(_sku, _quantity)
        notAuction(_sku)
        paidEnough(items[_sku].price.mul(_quantity))
        checkValue(_sku,_quantity)
    {
        Item storage item = items[_sku];
        uint total = item.price.mul(_quantity);
        require(msg.sender.balance > (total),"Buy Item: Check BALANCE");
        item.inventory = item.inventory.sub(_quantity);
        Orders(orderAddress).createOrder(_sku, total,msg.sender, _quantity);
        address(orderAddress).transfer(total);
        emit Sold(address(this).balance);
    }

    function wonItem(uint _sku,uint _price,address _winner)
        public
        verifyAuction(_sku,msg.sender)
    {
        Item storage item = items[_sku];
        Orders(orderAddress).createOrder(_sku,  _price,_winner,item.inventory);
        item.inventory = 0;
        delete auctionlist[msg.sender];
        emit Sold(skuCount);
    }

    function getSummary() public view returns (
        string,
        uint,
        address,
        uint,
        address)
    {
        return (
            storeName,
            address(orderAddress).balance,
            orderAddress,
            skuCount,
            manager
            );
    }

    function fetchItem(uint _sku) public view 
        returns (
            uint sku,
            string name,
            string ipfsHash,
            string description,
            uint price,
            uint inventory,
            address _auction,
            address seller
        )
    {
        Item storage item = items[_sku];
        sku = item.sku;
        name = item.name;
        ipfsHash = item.ipfsHash;
        description = item.description;
        price = item.price;
        seller = item.seller;
        _auction = item.auction;
        inventory = item.inventory;
        return (sku, name, ipfsHash, description, price, inventory, _auction, seller);
    }
 
    /* ->>>>>>>>>>>>>>>>>>>>>>>>>>>>> */
    /* Factory Admin Functions        */ 
    /* ->>>>>>>>>>>>>>>>>>>>>>>>>>>>> */
    
    function setOrderAddress(address _orderAddress) public 
        verifyCaller(factoryAddress)
        returns (bool)
    {
        orderAddress = _orderAddress;
        return(true);
    }
  
    function setFactoryAddress(address _factoryAddress) public 
        verifyCaller(factoryAddress)
        returns (bool)
    {
        factoryAddress = _factoryAddress;
        return(true);
    }
}
