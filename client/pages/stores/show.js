import React, {Component} from 'react';
import Layout from '../components/Layout'
import { Card, Grid, Button } from 'semantic-ui-react';
import getWeb3 from '../../lib/getWeb3'
import getStore from '../../lib/getStore'
import { Link } from '../../routes'

class StoreShow extends Component {
   
  state = {
        web3:undefined,
        storeName:null,
        balance:null,
        ordersAddress:null,
        itemsCount:null, 
        manager:null 
  }

  static async getInitialProps(props){
      return {
       address: props.query.address
      };
  }

  setStateAsync(state) {
    return new Promise((resolve) => {
      this.setState(state, resolve)
    });
  } 

  componentDidMount = async () => {
    // Get network provider and web3 instance.
    // See utils/getWeb3 and getStore for more info.
     const { address } = this.props
     try{
      const web3 = await getWeb3()
      const accounts = await web3.eth.getAccounts()
      const store = await getStore(web3, address)
      const summary = await store.methods.getSummary().call();

    await this.setStateAsync({
        web3: web3,
        storeName: summary[0],
        balance: web3.utils.fromWei(summary[1],'ether'),
        ordersAddress: summary[2],
        itemsCount: summary[3],
        manager: summary[4]})

     }catch(err){
      alert( `Failed to load load store `)
      console.log(err)
     }
  }
  renderCards(){
     const {
      web3,
      balance,
      manager,
      storeName,
      ordersAddress,
      itemsCount
     } = this.state

     const items = [
        {
           header: manager,
           meta: 'Address of Manager',
           description: 'The manager created this store and can withdraw',
           style: { overflowWrap: 'break-word'} 
        },
        {
           header: storeName,
           meta: 'Store Name',
           description: 'You must contribute atleast this amount of wie',
           style: { overflowWrap: 'break-word'} 
        },
        {
           header: ordersAddress,
           meta: 'Orders Contract Address',
           description: 'Orders Information can be found at this address',
           style: { overflowWrap: 'break-word'} 
        },
        {
           header: itemsCount,
           meta: 'itemsCount',
           description: 'Number of items for sale at this store',
           style: { overflowWrap: 'break-word'} 
        },
        {
           header: balance,
           meta: 'Store Balance (ether)',
           description: 'The balance is how much money this store has',
           style: { overflowWrap: 'break-word'} 
        }
     ]; 
     return <Card.Group items={items}/>;
  }
  render() {
      return (<Layout msg="Home" link="/">
               <h3>Store Information</h3>
               <Grid>
                 <Grid.Row>
                    <Grid.Column width={10}>
                      {this.renderCards()}
                    </Grid.Column>
                    <Grid.Column width={6}>
                    <Link route={`/orders/${this.state.ordersAddress}`}>
                      <a>
                       <Button primary>Orders</Button>
                      </a>
                    </Link>
                    <Link route={`/stores/${this.props.address}/requests`}>
                      <a>
                       <Button primary>Store Items</Button>
                      </a>
                    </Link>
                    </Grid.Column>
                 </Grid.Row>
               </Grid>
             </Layout>
     )
  }
}

export default StoreShow;
