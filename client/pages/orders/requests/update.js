import React, { Component } from 'react';
import  { Form, Button, Message, Input,Grid, Divider, Card } from 'semantic-ui-react';
import getWeb3 from '../../../lib/getWeb3'
import getStore from '../../../lib/getStore'
import getOrders from '../../../lib/getOrders'
import { Link, Router } from '../../../routes';
import ManageOrderForm from '../../components/manageOrderForm';
import Layout from '../../components/Layout';

class RequestNew extends Component {
   state ={
      orders:'',
      accounts:'',
      isManager:'',
      name:'',
      ipfsHash:'',
      value:'',
      description:'',
      quantity:'',
      state:'',
      deliver:'',
      withdrawStatus:'',
      loading:false,
      errorMessage:''
   }
 
   static async getInitialProps(props){
      return {
       address: props.query.address,
       sku: props.query.sku,
       orderId: props.query.orderId
      };
   }

   componentDidMount = async () => {
      const web3 = await getWeb3()
      const accounts = await web3.eth.getAccounts()
      const orders = await getOrders(web3, this.props.address)
      const storeAddress = await orders.methods.storeAddress().call({from:accounts[0]})
      const store = await getStore(web3, storeAddress)
      const detailStore = await store.methods.fetchItem(this.props.sku).call()
      const detailOrder = await orders.methods.fetchOrder(this.props.orderId).call({from:accounts[0]})
      const manager = await orders.methods.manager().call({from:accounts[0]})
      const isManager = manager == accounts[0] ? true : false

      detailOrder.state=='5' && this.setState({withdrawStatus:'BUYER' })
      detailOrder.state=='6' && this.setState({withdrawStatus:'SELLER' })
      detailOrder.state=='2' && this.setState({withdrawStatus:'SELLER' })
      detailOrder.state=='3' && this.setState({withdrawStatus:'SELLER' })

      this.setState({
                    orders:orders,
                    accounts:accounts,
                    isManager:isManager,
                    name:detailStore.name,
                    ipfsHash:detailStore.ipfsHash,
                    description:detailStore.description,
                    value:detailOrder.price/1e18,
                    quantity:detailOrder.quantity,
                    state:detailOrder.state,
                    deliver:detailOrder.deliver})
   }
   renderCards(){
      const emptyAddress = /^$/.test(this.state.deliver);
      var stateInfo;
      { emptyAddress ? this.setState({deliver:"Delivery information required"}) : "" }
      switch(this.state.state) {
        case '0':
           stateInfo='Item Sold Waiting for delivery adder information';
           break;          
        case '1':
           stateInfo='Item address updated WAITING for SELLER to SHIP';
           break;          
        case '2':
           stateInfo='Item Shipped please confirm BUYER to confirm RECIEVED';
           break;          
        case '3':
           stateInfo='Item RECIEVED';
           break;          
        case '4':
           stateInfo='REFUND requested SELLER to APPROVE (Disagreements: Please contact Site Admin)';
           break;          
        case '5':
           stateInfo='SELLER has APPROVED refund Buyer can withdraw funds';
           break;          
        case '6':
           stateInfo='SELLER reject refund please contact SITE ADMINISTRATION to Resolve';
           break;          
        case '7':
           stateInfo='Order COMPLETE there are no further actions';
           break;          
      }
      const item =  [{
           image: 'https://ipfs.io/ipfs/'+this.state.ipfsHash,
           header: this.state.name,
           meta: 'Total: '+this.state.value + ' (Ether) Quantity:'+ this.state.quantity,
           description: stateInfo,
           extra: 'Address: '+this.state.deliver,
           style: { overflowWrap: 'break-word'} 
        },];
      return <Card.Group items={item}/>;
   }
   onClick = async () =>{
      const {accounts, orders, withdrawStatus} = this.state
      withdrawStatus =='SELLER' && 
      await orders.methods.managerGetPaid(this.props.orderId).send({from:accounts[0]})
      withdrawStatus =='BUYER' && 
      await orders.methods.buyerWithdraws(this.props.orderId).send({from:accounts[0]})
   }
   render(){
     const {orders, accounts, isManager,withdrawStatus } = this.state
     return (
        <Layout msg="Orders" link={`/orders/${this.props.address}`}>
          <Link route={`/orders/${this.props.address}`}>
             <a> Back </a>
             </Link>
             <Grid columns={2} relaxed>
               <Grid.Column>
                  {this.renderCards()}
             </Grid.Column>
             <Divider vertical></Divider>
             <Grid.Column>
              <h3>Make Changes</h3>
              <ManageOrderForm contract={orders} accounts={accounts} isManager={isManager} id={this.props.orderId}/>
            </Grid.Column>
             <Grid.Column>
              {withdrawStatus ? <Button primary onClick={this.onClick}>Withdraw</Button> :''}
            </Grid.Column>
          </Grid>
       </Layout>
     )
   }
}

export default RequestNew;
