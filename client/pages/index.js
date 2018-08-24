import React, { Component} from 'react'
import Web3Container from '../lib/Web3Container'
import { Card, Button } from 'semantic-ui-react' 
import Layout from './components/Layout.js'
import { Link } from '../routes'

class StoresIndex extends Component {
  state ={
    contract:this.props.contract,
    accounts:this.props.accounts,
    web3:this.props.web3,
    isAdmin:false,
    isStoreMananger:false,
    stores:undefined,
    items:undefined
  };

  componentDidMount = async  () => {
    const { web3, accounts, contract } = this.state
    const stores = await contract.methods.getDeployedStores().call({from:accounts[0]});
    const isAdmin = await contract.methods.adminStaff(accounts[0]).call({from:accounts[0]});
    const isStoreManager = await contract.methods.approvedStoreOwner(accounts[0]).call({from:accounts[0]});
    const items = await stores.map(address => {
       return {
         header:address,
         description:(<Link route={`/stores/${address}`}><a>View Store</a></Link>),
         fluid: true
       };
    });
    this.setState({items:items,isAdmin:isAdmin,isStoreManager:isStoreManager})
  };

  render() { 
     const { contract, stores, accounts, items, isAdmin,isStoreManager} = this.state;
     
     return (
      <Layout msg='Create Store For Approved Managers' link='stores/new'>
        <div>
          <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.3.1/semantic.min.css"></link>
          <h3>Open Stores</h3>
          { isAdmin ? (
          <Link route="/factory/admin">
           <a>
            <Button 
              floated="right" 
              content="Administration"
              icon="add circle"
              primary
            />
           </a>
          </Link> ) :( isStoreManager ? (
               <Link route="/stores/new">
                <a>
                 <Button 
                  floated="right" 
                  content="Create Store"
                  icon="add circle"
                  primary
                 />
               </a>
             </Link>) :"")}
          <Card.Group items={items} /> 
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
