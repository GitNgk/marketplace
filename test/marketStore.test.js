var Factory = artifacts.require("./Factory.sol");
var Store = artifacts.require("./Store.sol");
var Orders = artifacts.require("./Orders.sol");
var Auction = artifacts.require("./Auction.sol");


contract('Market Store Contract',function(accounts) {
   let factory;
   let auction;
   let auctionAddress;

   /* Testing Purchase Path */
   let orders;
   let store;
   let storeAddress;
   let orderAddress;

   /* Testing Refund Path */
   let ordersRefund;
   let storeRefund;
   let storeAddressTwo;
   let orderAddressTwo;

   console.log(accounts);

   beforeEach('Run Before Each Test', async () => {

      /* Factory contract store and refund pariod setup */
      factory =  await Factory.deployed(0,{from: accounts[0],gas:5000000});
      await factory.addStoreOwner(accounts[0],{from:accounts[0],gas:5000000});
      await factory.createStore('NUH',{from:accounts[0],gas:5000000});
      await factory.addStoreOwner(accounts[0],{from:accounts[0],gas:5000000});
      await factory.updateRefundTime(20,{from:accounts[0]});
      await factory.createStore('NGK',{from:accounts[0],gas:5000000});
      let storeAddressList = await factory.getDeployedStores();

      storeAddress  = storeAddressList[0];
      storeAddressTwo  = storeAddressList[1];

      /* Testing Purchase Path */
      store = await Store.at(storeAddress );
      orderAddress = await factory.storeAndOrders(storeAddress );
      orders = await Orders.at(orderAddress);

      /* Testing Refund Path */
      storeRefund = await Store.at(storeAddressTwo);
      orderAddressTwo = await factory.storeAndOrders(storeAddressTwo);
      ordersRefund = await Orders.at(orderAddressTwo);
   });

   describe('1 - PURCHASE & COMPLETE: Factory, Store & Orders', () => {
      it('check account 0 is approved store owner is now disabled after creating store', async () => {
         const approveOwner = await factory.approvedStoreOwner.call(accounts[0])
         assert.ok(!approveOwner);
      });

      it('deploys a factory, store and orders contract', async () => {
         assert.ok(factory.address);
         assert.ok(store.address);
         assert.ok(orders.address);
         log("factory:",factory.address,"store: ",store.address,"orders:", orders.address);
      });

      it('marks account[0] as the store manager',async () => {
         const manager = await store.manager.call()
         assert.equal(accounts[0],manager);
      });

     it('allows manager to create item for sale', async () =>{
         await store.addItem('Sweets','IPFSHASHTEMP','Cola Cubes',web3.toWei('5','ether'),30,false,0,{from:accounts[0],gas:3000000});
         const isItem = await store.items(0);
         assert(isItem);
      });

     it('fetch item details for sale', async () =>{
         const isItem = await store.fetchItem(0,{from:accounts[0],gas:3000000});
         //console.log(isItem[4].toNumber());
         assert(isItem);
      });

      it('requires a minimum payment 1000000', async () => {
         try {
            await store.buyItem('0','1',
            {
               value:web3.toWei('2','ether'),
               from:accounts[1]
            });
            assert(false);
         } catch (err){
           assert(err);
         }
      });

      it('buy item using account[1]', async () => {
         await store.buyItem('0','1',
         {
            value:web3.toWei('5','ether'),
            from:accounts[1]
         });

         assert(true,'Item Purchased by account[1]');
         const order = await orders.orders(0);
         assert.equal(accounts[1],order[2],'Order confirmed by account 1')
      });

      it('buyer to updates address information', async () => {
         await orders.updateAddress('0','1 Address street City Post Code Uk england',{  from:accounts[1]});
         const order = await orders.orders(0);
         console.log('\torder postal address: ',order[3]);
         assert.equal(1,order[6],'buyer updates address')
      });

      it('Manager to Ship Item 0', async () => {
         await orders.shipItem('0',{from:accounts[0]});
         assert(true,'Item Purchased by account[1]');
         const order = await orders.orders(0);
         assert.equal(2,order[6],'Manager Ships Item')
      });

      it('buyer to confirm item Recieved', async () => {
         await orders.receiveItem('0',{  from:accounts[1]});
         assert(true,'Item Purchased by account[1]');
         const order = await orders.orders(0);
         assert.equal(3,order[6],'buyer update item recieved')
      });

      it('seller receives payment', async () => {
         let balance0 = await web3.eth.getBalance(accounts[0]);
         let contractbalance = await web3.eth.getBalance(orderAddress);


         balance0 = await web3.fromWei(balance0,'ether');
         contractbalance = await web3.fromWei(contractbalance,'ether');
         balance0 = parseFloat(balance0);
         contractbalance = parseFloat(contractbalance);
         balance1 = balance0;

         log("before account_0:",balance0,"","","before orders balance:",contractbalance);

         await orders.managerGetPaid('0',{from:accounts[0]});

         balance0 = await web3.eth.getBalance(accounts[0]);
         contractbalance = await web3.eth.getBalance(orderAddress);

         balance0 = await web3.fromWei(balance0,'ether');
         contractbalance = await web3.fromWei(contractbalance,'ether');
         balance0 = parseFloat(balance0);
         contractbalance = parseFloat(contractbalance);;

         log("after account_0:",balance0,"","","after orders balance:",contractbalance);

         assert(balance0>balance1);
      });
   });

   describe('2 - PURCHASE & REFUND: Factory, Store & Orders', () => {

      it('add manager to admin staff',async () => {
         log("factory:",factory.address,"store:",storeRefund.address,"orders:", ordersRefund.address);

         await factory.addAdminStaff(accounts[2],{from:accounts[0]});
         const isAdmin = await factory.adminStaff(accounts[2]);
         assert(isAdmin);
      });

      it('change refund time for refunds test', async () => {
         let refundTime = await factory.refundTime.call();
         await factory.updateRefundTime(30,{from:accounts[2]});
       //  console.log("out time1:"+ refundTime);
         refundTime = await factory.refundTime.call();
         assert.equal(30,refundTime);
       //  console.log("out time2:"+ refundTime);
      });

      it('allows manager to create item for sale', async () =>{
         await storeRefund.addItem('Sweets','IPFSHASHTEMP','Cola Cubes',web3.toWei('5','ether'),10,false,0,{from:accounts[0],gas:3000000});
         const isItem = await storeRefund.items(0);
         assert(isItem);
      });

      it('buy item using account[1]', async () => {
         await storeRefund.buyItem('0','2',
         {
            value:web3.toWei('10','ether'),
            from:accounts[1]
         });
         const order = await ordersRefund.orders(0);
                log("item:",order[0],"status:",order[6],"Quantity:",order[4])
         assert.equal(accounts[1],order[2],'Order confirmed by account 1')
      });

      it('buyer to updates address information', async () => {
         await ordersRefund.updateAddress('0','10 Downing St',{  from:accounts[1]});
         const order = await ordersRefund.orders(0);
         //console.log('state: ',web3.utils.toAscii(order[3]));
         assert.equal(1,order[6],'buyer updates address')
      });

      it('Manager to Ship Item 1', async () => {
         await ordersRefund.shipItem('0',{  from:accounts[0]});
         assert(true,'Item Purchased by account[1]');
         const order = await ordersRefund.orders(0);
                log("item:",order[0],"status:",order[6],"Quantity:",order[4])
         assert.equal(2,order[6],'Manager Ships Item')
      });

      it('buyer requests refund', async () => {
         await ordersRefund.requestRefund('0',{  from:accounts[1]});
         const order = await ordersRefund.orders(0);
         log("item:",order[0],"status:",order[6],"Quantity:",order[4])
         assert.equal(4,order[6],'buyer update item recieved')
      });

      it('buyer fails to approve refund', async () => {
         try {
            await ordersRefund.approveRefund('0',{ from:accounts[1]});
            assert(false,'dissallowed account[1]');
         } catch (err){
            assert(err);
         }
      });
      
      it('buyer tries to withdraw before approved', async () => {
         try {
            await ordersRefund.buyerWithdraws('0',{ from:accounts[1]});
            assert(false,'dissallowed account[1]');
         } catch (err){
            assert(err);
         }
      });
      it('seller approves refund', async () => {
         await ordersRefund.approveRefund('0',{from:accounts[0]});
         const order = await ordersRefund.orders.call(0);
         //console.log('state: ',order[6])
         assert.equal(5,order[6].c,'setting state to approved')
      });

      it('buyer withdraw refunded amount', async () => {
         let balance0 = await web3.eth.getBalance(accounts[1]);
         let contractbalance = await web3.eth.getBalance(orderAddressTwo);

         balance0 = await web3.fromWei(balance0,'ether');
         contractbalance = await web3.fromWei(contractbalance,'ether');
         balance0 = parseFloat(balance0);
         contractbalance = parseFloat(contractbalance);
         balance1 = balance0;

         log("before account_1:",balance0,"","","before orders balance:",contractbalance);


         await ordersRefund.buyerWithdraws('0',{from:accounts[1]});
         balance0 = await web3.eth.getBalance(accounts[1]);
         contractbalance = await web3.eth.getBalance(orderAddressTwo);

         balance0 = await web3.fromWei(balance0,'ether');
         contractbalance = await web3.fromWei(contractbalance,'ether');
         balance0 = parseFloat(balance0);
         contractbalance = parseFloat(contractbalance);;

         log("after account_1:",balance0,"","","after orders balance:",contractbalance);

         assert(balance0>balance1);
      });   
   });

   describe('3 - AUCTION: Factory, Store & Orders', () => {
      it('allows manager to create item for Auction', async () =>{
         await store.addItem('Wolverine Figure','IPHASHGOESHERE','Toys',web3.toWei('2','ether'),5,true,5,{from:accounts[0],gas:3000000});
         const isItem = await store.items(1);
         assert(isItem);
      })

      it('check auction has been activated', async () =>{
         let item = await store.fetchItem('1');
         auction = await Auction.at(item[6]);
         auctionAddress = auction.address;
         assert.ok(auction.address);
      })

      it('check beneficiary', async () =>{
         let beneficiary = await auction.beneficiary();
         assert.equal(orderAddress,beneficiary);
      })

      it('create bid', async () =>{
         await auction.bid({value:web3.toWei('1','ether'),from:accounts[1]});
         let bid = await auction.highestBid();
         currentBid = web3.fromWei(bid,'ether');
         console.log("\tBid: "+ currentBid +" ether");
         assert.equal(1,currentBid);
      })
      it('create bid 2', async () =>{
         await auction.bid({value:web3.toWei('2','ether'),from:accounts[2]});
         let bid = await auction.highestBid();
         currentBid = web3.fromWei(bid,'ether');
         console.log("\tBid: "+ currentBid +" ether");
         assert.equal(2,currentBid);
      })

      it('withdraw bid 1', async () =>{
         let balance0 = await web3.eth.getBalance(accounts[1]);
         let contractbalance = await web3.eth.getBalance(auctionAddress);

         balance0 = web3.fromWei(balance0,'ether');
         contractbalance = web3.fromWei(contractbalance,'ether');
         balance0 = parseFloat(balance0);
         contractbalance = parseFloat(contractbalance);
         balance1 = balance0;

         log("before account_1:",balance0,"","","before auction balance:",contractbalance);

         await auction.withdraw({from:accounts[1]});

         balance0 = await web3.eth.getBalance(accounts[1]);
         contractbalance = await web3.eth.getBalance(auctionAddress);

         balance0 = web3.fromWei(balance0,'ether');
         contractbalance = web3.fromWei(contractbalance,'ether');
         balance0 = parseFloat(balance0);
         contractbalance = parseFloat(contractbalance);;

         log("after account_1:",balance0,"","","after auction balance:",contractbalance);

         assert(balance0>balance1);
      })

      it('create bid after auction time ends', async () =>{
         await sleep(3000);
         try {
            await auction.bid({value:web3.toWei('3','ether'),from:accounts[1]});
            assert(false);
         } catch(err){
            assert(true);
         }
      })

      it('end auction ', async () =>{
         let ordersBalance = await web3.eth.getBalance(orderAddress);
         let auctionbalance = await web3.eth.getBalance(auctionAddress);

         ordersBalance = await web3.fromWei(ordersBalance,'ether');
         auctionbalance = await web3.fromWei(auctionbalance,'ether');
         ordersBalance = parseFloat(ordersBalance);
         auctionbalance = parseFloat(auctionbalance);
         ordersBalance1 = ordersBalance;

         log("before: orders Balance:",ordersBalance,"","","before: auction balance:",auctionbalance);
         await auction.auctionEnd();

         ordersBalance = await web3.eth.getBalance(orderAddress);
         auctionbalance = await web3.eth.getBalance(auctionAddress);

         ordersBalance = await web3.fromWei(ordersBalance,'ether');
         auctionbalance = await web3.fromWei(auctionbalance,'ether');
         ordersBalance = parseFloat(ordersBalance);
         auctionbalance = parseFloat(auctionbalance);

         log("after: orders Balance:",ordersBalance,"","","after: auction balance:",auctionbalance);
         assert(ordersBalance>ordersBalance1);
      })

   });

   log = (desc1,arg1,desc2,arg2,desc3,arg3) => {
      console.log("\t----------- Values ------------>");
      console.log("\t| "+ desc1 + arg1); 
      console.log("\t| "+ desc2 + arg2 );
      console.log("\t| "+ desc3 + arg3 );
      console.log("\t------------------------------->");
  };
  sleep = ( sleepDuration ) => {
    var now = new Date().getTime();
    console.log('\t......waiting for auction to end')
    while(new Date().getTime() < now + sleepDuration){ /* do nothing */}
      console.log('\t......wait ended')
   }
});
