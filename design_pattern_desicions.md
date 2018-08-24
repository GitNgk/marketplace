# Online Marketplace
## Description
Create an online marketplace that operates on the blockchain. There are a list of stores on a central marketplace where shoppers can purchase goods posted by the store owners. The central marketplace is managed by a group of administrators. Admins allow store owners to add stores to the marketplace. Store owners can manage their store’s inventory and funds. Shoppers can visit stores and purchase goods that are in stock using cryptocurrency.

### User Stories:
An administrator opens the web app. The web app reads the address and identifies that the user is an admin, showing them admin only functions, such as managing store owners. An admin adds an address to the list of approved store owners, so if the owner of that address logs into the app, they have access to the store owner functions. An approved store owner logs into the app. The web app recognizes their address and identifies them as a store owner. They are shown the store owner functions. They can create a new storefront that will be displayed on the marketplace. They can also see the storefronts that they have already created. They can click on a storefront to manage it. They can add/remove products to the storefront or change any of the products’ prices. They can also withdraw any funds that the store has collected from sales. A shopper logs into the app. The web app does not recognize their address so they are shown the generic shopper application. From the main page they can browse all of the storefronts that have been created in the marketplace. Clicking on a storefront will take them to a product page. They can see a list of products offered by the store, including their price and quantity. Shoppers can purchase a product, which will debit their account and send it to the store. The quantity of the item in the store’s inventory will be reduced by the appropriate amount.

## Design Pattern & Decision

### Introduction
The most common design pattern used in this project is to restrict access. These restrictions have been explained below:

### Restrict Access
Modifications to your contract’s state or call to contract’s functions have been restricted using `function modifiers`.

#### modifiers & required 
Used to check for execution as early as possible in the function body and throws an exception if the condition is not met:
e.g
```
   /* Transaction user checks */
   modifier verifyCaller (address _address) { require (msg.sender == _address,"Check ADDRESSs"); _;}
   modifier restricted() { require(msg.sender == manager,"Check is MANAGER"); _; }
```
1. Factory Contract
 - Only Manager Can Create Administrators.
 - Only Administrator can resolve disputes, update Factory, Store and Order contract addresses this facilitates future upgrades for each and migrations to new contracts

2. Store Contract
 - Only Manager can create or update Items for sale information
 - Only Factory contract can update Orders contract and Factory contract address
 - Only Auction contract created for Item can complete order.

3. Order Contract
 - Only contract address set in by factory can create order.
 - Only manager can update order to shipped Item.
 - Only buyer can update order to received Item
 -- Provided in shipped state
 - Only buyer can request Refund provide it's within set time refund time that is controlled in Factory contract and administrators.
 -- Refund must be requested before time expires (30 days to refund once shopped).
 -- Only manager or site administrator can approve refunds
 - Manager can only receive payment once the time scale for refund expires and there is no Refunds request

 - Only Factory contract administrators can:
 -- Resolve disputes when seller disagrees to refund but currency is locked in contract.
 -- Update Store contract address
 -- Update Factory contract address

4. Auction Contract
 - New auction is created for each item. The calling contract and order address will be used to update 
 inventory on Store and transfer funds.
 - Winning bid funds are locked until order created and refund can then be actioned.
 - Failed bid refund user depending on address.

### Auto Deprecation
#### Auction
 Is used in the Auction contract with a duration set by the Stores once this exceeds, no further Bids can occur the contract winning Bid ether transferred to Orders and remaining ether left for withdrawal by
 losing bidders.
```
        require(
            now <= auctionEnd,
            "Auction already ended."
        );

```

#### Orders
Order state remain active until the return policy duration is reached at this point if the order is not in Refund state payment to manager can be made.

### Pull over Push Payments
 Orders contract allows payments by means of payable function and withdrawals. Each are separated and constrained by state of order. This allow security for buyer to be able to get refunds should the item be unsatisfactory. It also eliminates reenterance by using changes to state of orders and limiting the withdrawal to buyer or seller using Restrict Access.
```
 e.g
 function managerGetPaid(uint _orderId) payable public 
      restricted
      onlyAfter(_orderId)
      notComplete(_orderId)
   {
      Order storage order = orders[_orderId];
      require(order.state != State.Refund,"Check REFUND" );
      order.state = State.Complete;
      manager.transfer(order.price);
   }

   function buyerWithdraws(uint _orderId) payable public 
      verifyCaller(orders[_orderId].buyer)
      approvedRefund(_orderId)
   {
       Order storage order = orders[_orderId];
       order.state = State.Complete;
       msg.sender.transfer(order.price);
   }
```

### State Machine
Orders contract has various states and only specific participants such as manager, buyer or admin can change them.:
```
   /* Sale timming check */
   modifier onlyBefore(uint _orderId) {require(now < orders[_orderId].date,"Check BEFORE time expires"); _; }
   modifier onlyAfter(uint _orderId) {require(now > orders[_orderId].date,"Check AFTER time expires"); _; }

   /* Sale status checks */
   modifier sold (uint _orderId) {require(orders[_orderId].state == State.Sold,"Check Item SOLD"); _;}
   modifier shipped (uint _orderId) {require(orders[_orderId].state == State.Shipped,"Check Item SHIPPED"); _;}
   modifier received (uint _orderId) {require(orders[_orderId].state == State.Received,"Check Item RECEIVED"); _;}
   modifier notComplete(uint _orderId){require(orders[_orderId].state != State.Complete,"Check Item COMPLETE" );_;}
```
e.g Purchasing example
```
 Simple Purchase {State}

 \o/
  |        \o/
 / \        |
  |        / \
  |         ^
 =|=========|===============Store.sol========================================================================
  |         |
  |---------|--------------addItem>----------->[Creates Item sets auction or sale method]
  |         |--------------buyItem>----------->[Buyer buys item1 --reduces the inventory]    {forSale}              StartTime
  |         |
  |         |
 =|=========|==============Orders.sol========================================================================
  |         |
  |         |                                                              
  |---------|-------Manager-------shipItem>--------------------------------------------->     {Order Shipped }
  |         |       
  |         |-------buyer-------recieveItem>-------------------------------------------->     {Order recieved}
  |          
  |
  |-----------------manager---managerGetPaid>->[Once received or order shipped > 30 days]->   {Order Complete}   EndTime

```
e.g Auction example
```
 \o/
  |        \o/
 / \        |
  |        / \     \o/
  |         |       |
  |         |      / \
  |         |       |
 =|=========|=======|=======Store.sol============================================================================
  |         |       |
  |---------|-------|------addItem>----------->[Creates Item sets auction]                 {forAuction}
  |         |       |
  |         |       |
 =|=========|=======|=======Auction.sol==========================================================================
  |         |       |
  |         |-------|------bid>--------------->[Create HighestBid](lock bid value)         {Auction (now<auctionEnd}}
  |         |       |
  |         |       |------bid>--------------->[Replace last bid ](lock bid value)-----
  |         |       |                                                                 |
  |         |-------|-withdraw>-------------->(allow previous bid amount withdrawal)<-|
  |                 |
  |-----------------|-------auctionEnd>------->[Auction time ends inventory update in 
  |                 |                          Store and ether transfer to Orders   ]
  |                 |
  |                 |
 =|=================|======Orders.sol============================================================================
  |                 |
  |                 |                                                              
  |-Manager---------|-------shipItem>----------------------------------------------->     {Order Shipped }
  |                 |       
  |                 |-buyer-recieveItem>-------------------------------------------->     {Order recieved}
  |          
  |-----------------manager---managerGetPaid>->[Once received or order shipped > 30 days]->   {Order Complete}

```
### Upgradeable Contracts

A combination of `Registry` with `Forward data and calls` methodology used to help future upgrade and fixes. The Factory contract maintains.

registry information:

- Factory Contract: Upgraded by creating new instance copying address from old then updating Stores and Orders contracts with new Factory address.

- Store & Orders Contract: Using two methods.
1. New instance as above of Factory contract with new code.
2. Create new instance of Orders.sol and/or Store.sol and changing the relay address in Factory contract.

 ```

                           Factory [storeAddress & ordersAddress]
                         /                                       \
                         |                                       |
                         |                                       |
                        \|/                                      |
   Auction <----------- Store                                   \|/
     |      [ordersAddress & factoryAddress]<-------(update contract Address)
     |                   |                                       |
     |                   |                                       |
     |                   |                                       |
     |        (Buy item create order)                            |
  (Transfer)             |                                       |
  (locked funds)       (Pay Order)                               |
     |                   |                                       |
     |                   |                                       |
     |                  \|/                                     \|/
      ---------------->Orders<------------- -------(update contract Address & resolve disputes)
            [storeAddress & factoryAddress]
```

#### Registry Contract
Factory: Contains a registry of Stores and Orders contracts & changed via administrator functions.
```
    address[] public deployedStores;
    mapping(address => address) public storeAndOrders;
```
Store:Contains a registry of Factory and Orders contracts & changed via administrator functions
```
   address public factoryAddress;
   address public orderAddress;
```
Orders:Contains a registry of Factory and Store contracts & changed via administrator functions
```
   address public factoryAddress;
   address public orderAddress;
```
note: Factory contract also employs Forward data and calls to Store and Orders

#### Forward data and calls
Store: Contract forwards data to Auction & Orders Contract
