# Online Marketplace

This project is a Solidity Implementation of Online Marketplace.

## Contracts

The application is split in four sections:

 1. Factory: Create deploy Store and Orders contracts and nominate site administrator and manager.
 2. Store: Maintains Items information, Sale channel and inventory.
 3. Order: Maintain order information, refunds, payments.
 4. Auction: Auction maintain auction data and payment lock and release.

The contracts are split to ease upgrades and bug fixes.

### Factory:
The Factory contract has four main sections with four levels of access:

 1.	Anyone: Query to get list of Stores and addresses
 2.	Administrators Only: 
 	- Grant Store Creation privileges.
    - Resolve payment dispute for orders.
 	- Change Default refund period time for future stores.
 	- Change Store and Orders contract address to facilitate upgrades.
 3. Store Managers: Create One Store.
 4. Manager (Site) Only: Add and delete Administrators.

### Store
Each store has a Name and Owner/Manager. A manager can only have ONE store per administrator grant (second Store would need administrator to add user again). The store maintains item related information’s such as product, price, inventory and sale method. IPFS is used to maintain item Images. Each store is linked to an orders contract that maintains the orders information for the store once product is purchased. Items can be brought from the store or auctioned. Auctioned items trigger an auction contract and with an auction lifetime. Payment are never held in the store contract.

Each store has a contract address for the calling factory and relevant orders contract. Task between the three are verified as authentic request through these addresses.

### Orders
Maintains orders for its store. Order scan only be created from the Store associated with the contract. Each order has 8 stages.
 1. Sold: Initial state of contract.
 2. DeliveryAddress: Buyer to update address information.
 3. Shipped: Seller(manager) issue this stage
 4. Received: Buyer can confirm receipt
 5. Refund: Buyer Only request refund (REFUND requests can only occur after shipment and before refund time expires)
 6. Approved: Refund Approved by Store manager or Site administrators in case of dispute
 7. Rejected: Reject Refund by Store manager
 8. Complete: Complete after Refund time expires/Refund approved by store manager/ factory Admin/Ether withdrawn by seller or buyer

Orders contract locks payments until the refund time expires which is set on creation of the Store. This is maintained by site administrators and can be changed. The currency is completely locked once refund is activated and store manager approves it or factory admin staff resolve the dispute.

Each Orders contract has addresses for the Factory and its Store contract. Task between the three are verified as authentic request through these addresses. For example, only the Store contract can create orders.

### Auction (modified version from solidity documentation)
The Auction contract is triggered on creating an auction item in a Store. Each auction is specific for the Item and is contains pointer to the store orders contract for transferring ether and creating and order via Store(maintain Inventory).

# Installation
1. Install Truffle globally.

```npm install -g truffle```

2. Download the repository. This also takes care of installing the necessary dependencies.

```
Clone project: git clone https://github.com/GitNgk/marketplace.git
cd marketplace
npm install
```

3. Run the development console.
```
ganache-cli
```

4. Compile and migrate the smart contracts. Note inside the development console we don't preface commands with truffle.
```
truffle compile
truffle migrate --reset
```

5. Run the next.js server for the front-end. Smart contract changes must be manually recompiled and migrated.

```
// Change directory to the front-end folder
cd marketplace/client
// Serves the front-end on http://localhost:3000
npm run dev
```
Truffle can run tests written in Solidity or JavaScript against your smart contracts. Note the command varies slightly if you're in or outside of the development console.
```
// If outside the development console.. working directory marketplace
truffle test
```

### Running with MetaMask

Since truffle develop exposes the blockchain onto port 8545, you'll need to add a Custom RPC network of http://localhost:8545 in your MetaMask to make it work.
