import React, { Component} from 'react'
import Web3Container from '../../lib/Web3Container'
import { Card, Button, Grid, Segment, Divider, Form, Input, Message } from 'semantic-ui-react' 
import Layout from '../components/Layout.js'
import AddRemoveAdminForm from '../components/addRemoveAdminForm'
import AddRemoveStoreManagerForm from '../components/addRemoveStoreManagerForm'
import ChangeRefundTimeForm from '../components/changeRefundTimeForm'
import UpdateContractForm from '../components/updateContractForm'
import UpdateContractFactoryForm from '../components/updateContractFactoryForm'
import WithdrawStopStartForm from '../components/withdrawStopStartForm'
import ResolveDisputeForm from '../components/resolveDisputeForm'
import { Link } from '../../routes'

class StoresIndex extends Component {
  state ={
    contract:this.props.contract,
    accounts:this.props.accounts,
    web3:this.props.web3,
    change:'Administrator logged',
    administratorAccount:this.props.accounts[0],
    manager:'',
    refundTime:'',
    changeDescription:'Please take caution when making changes.',
    stores:undefined,
    items:undefined
  };
  componentDidMount = async  () => {
    const { web3, accounts, contract } = this.state
    const stores = await contract.methods.getDeployedStores().call({from:accounts[0]});
    const manager = await contract.methods.manager().call({from:accounts[0]});
    const refundTime = await contract.methods.refundTime().call({from:accounts[0]});
    const items = await stores.map(address => {
       return {
         header:address,
         description:(<Link route={`/stores/${address}`}><a>View Store</a></Link>),
         fluid: true
       };
    });
    this.setState({items:items,manager:manager,refundTime:refundTime})
  };

   renderCards(){
      const item =  [{
           header: 'Site Manager',
           meta: 'Manger: '+this.state.manager,
           description: 'Note: Only manager can add and remove Administrators',
           style: { overflowWrap: 'break-word'} 
        },{
           header: this.state.change,
           meta: 'Logged User '+this.state.administratorAccount,
           description: 'Refund Time Set for Stores: '+ this.state.refundTime/86400+' Days',
           style: { overflowWrap: 'break-word'}
        },];
      return <Card.Group items={item}/>;
   }
  render() { 
     const { web3, contract, stores, accounts, items } = this.state;
     return (
      <Layout msg="Home Page" link="/">
        <div>
          <h3>Site Administration</h3>
          <Grid>
            <Grid.Row>
             <Grid.Column width={8}>
              {this.renderCards()}
              <Divider section />
              <h4>Open Stores</h4>
              <Card.Group items={items} /> 
             </Grid.Column>

             <Grid.Column width={8}>
              <Segment color='red'>
               <h3>Store Administration</h3>
               <h4>Add & Remove Sellers</h4>
               <AddRemoveStoreManagerForm accounts={accounts} contract={contract} web3={web3} />
               <Divider section />
               <h4>Resolve Disputed Refunds</h4>
               <ResolveDisputeForm accounts={accounts} contract={contract} web3={web3} />
               <Divider section />
               <h4>Stop/Start withdrawals of Orders contract</h4>
               <WithdrawStopStartForm accounts={accounts} contract={contract} web3={web3} />
              </Segment>
              <Segment color='red'>
               <h3>Manager Tasks</h3>
               <h4>Add & Remove Site Administrators</h4>
               <AddRemoveAdminForm accounts={accounts} contract={contract} web3={web3} />
              </Segment>
              <Segment color='red'>
               <h3>Contract Upgrades and Site Administration</h3>
               <h4>Change the Factory Contract</h4>
               <UpdateContractFactoryForm accounts={accounts} contract={contract} web3={web3} />
               <Divider section />

               <h4>Contract Changes</h4>
               <UpdateContractForm accounts={accounts} contract={contract} web3={web3} />
               <Divider section />

               <h4>Change Refund Policy Time</h4>
               <ChangeRefundTimeForm accounts={accounts} contract={contract} />
              </Segment>
            </Grid.Column>
          </Grid.Row>
        </Grid>
       </div>
      </Layout>
    );
  }
}

export default () => (
  <Web3Container
    renderLoading={() => <div>Loading StoreFact Page...</div>}
    render={({ web3, accounts, contract }) => (
      <StoresIndex accounts={accounts} contract={contract} web3={web3} />
    )}
  />
)
