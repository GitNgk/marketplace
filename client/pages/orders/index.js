import React, {Component} from 'react';
import getWeb3 from '../../lib/getWeb3'
import getOrders from '../../lib/getOrders'
import getStore from '../../lib/getStore'
import { Button, Table } from 'semantic-ui-react';
import {Link } from '../../routes';
import Layout from '../components/Layout';
import OrdersRow from '../components/ordersRow';

class OrdersIndex extends Component {

   state = {
     requests:'',
     requestsCount:'',
     storeAddress:''
   }
   static getInitialProps = async (props) => {
      const { address } = props.query;
      return { address} ;
   }

   componentDidMount = async () => {
     const { address } = this.props
     var requests = null
     var requestsCount = null
     var storeAddress = null
     try{
         const web3 = await getWeb3()
         const accounts = await web3.eth.getAccounts()
         const orders = await getOrders(web3, address)
         const manager = await orders.methods.manager().call({from:accounts[0]});
         const buyer = await orders.methods.buyerList(accounts[0]).call({from:accounts[0]});
         storeAddress = await orders.methods.storeAddress().call({from:accounts[0]});

         if(manager == accounts[0]){
            requestsCount = await orders.methods.orderCount().call({from:accounts[0]});
            requests = await Promise.all(
            Array(parseInt(requestsCount)).fill().map((element,index) => {
                  return orders.methods.fetchOrder(index).call({from:accounts[0]})
               })
            );
         } else if(buyer) {
            requestsCount = await orders.methods.getOrdersList().call({from:accounts[0]});
            requests = await Promise.all(
                  requestsCount.map((element,index) => {
                  return orders.methods.fetchOrder(element).call({from:accounts[0]})
               })
            );
         } else {
            throw `Address: ${accounts[0]} not manager or customer!` 
         }
       }catch(err){
         alert( `Failed to load orders: `+err)

       }

     const requests = requests.map((request,index) => {
       return ( 
         <OrdersRow 
           key={index}
           id={index}
           request={request}
           requestsCount={requestsCount}
           ordersAddress={this.props.address}
         />
        );
    });
    this.setState({requests:requests,requestsCount:requestsCount,storeAddress:storeAddress})
   }

   render() {
      const {Header, Row, HeaderCell, Body} = Table;
      const { storeAddress } = this.state;
      return (
         <Layout msg="Store" link={`/stores/${storeAddress}/requests`}>
          <h3>Orders List</h3>
          <Table>
           <Header>
            <Row>
             <HeaderCell>Order Id</HeaderCell>
             <HeaderCell>Sku</HeaderCell>
             <HeaderCell>Price in Ehter</HeaderCell>
             <HeaderCell>Delivery</HeaderCell>
             <HeaderCell>Quantity</HeaderCell>
             <HeaderCell>Refund Before Date</HeaderCell>
             <HeaderCell>Order Status</HeaderCell>
             <HeaderCell>Update Order</HeaderCell>
            </Row>
           </Header>
           <Body>{this.state.requests}</Body>
          </Table>
          <div>Found {this.state.requestsCount} Orders.</div>
         </Layout>
      );
   }
}

export default OrdersIndex;
