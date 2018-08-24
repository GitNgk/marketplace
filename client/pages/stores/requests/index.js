import React, {Component} from 'react';
import getWeb3 from '../../../lib/getWeb3'
import getStore from '../../../lib/getStore'
import { Button, Table } from 'semantic-ui-react';
import {Link } from '../../../routes';
import Layout from '../../components/Layout';
import RequestRow from '../../components/RequestRow';

class RequestIndex extends Component {

   state = {
     requests:'',
     requestsCount:'',
     orderAddress:''
   }
   static getInitialProps = async (props) => {
      const { address } = props.query;
      return { address} ;
   }

   componentDidMount = async () => {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.
     const { address } = this.props
     var requests = null
     var requestsCount = null
     var approversCount = null
     var isManager = null 
     var orderAddress = null 

     try{
         const web3 = await getWeb3()
         const accounts = await web3.eth.getAccounts()
         const store = await getStore(web3, address)
         requestsCount = await store.methods.skuCount().call();
         orderAddress = await store.methods.orderAddress().call();
         isManager = await store.methods.manager().call();

         isManager = Boolean(accounts[0] == isManager) 

         requests = await Promise.all(
            Array(parseInt(requestsCount)).fill().map((element,index) => {
               return store.methods.fetchItem(index).call()
            })
         );
       }catch(err){
         alert( `Failed to load load store `+err)

       }

     const requests = requests.map((request,index) => {
       return ( 
         <RequestRow 
           key={index}
           id={index}
           request={request}
           address={this.props.address}
           approversCount={approversCount}
           isManager={isManager}
           address={this.props.address}
         />
        );
    });
    this.setState({requests:requests,requestsCount:requestsCount,isManager:isManager,orderAddress:orderAddress})
   }

   render() {
      const { isManager,orderAddress } = this.state;
      const {Header, Row, HeaderCell, Body} = Table;
      return (
         <Layout msg="Store Orders" link={`/orders/${orderAddress}`} >
          <h3>Store</h3>
	  <Link route={`/stores/${this.props.address}/requests/new`}>
           <a>
             {isManager ? <Button primary floated="right" style={{marginBottom:10}}>New Sale Item</Button> :""}
           </a>
          </Link>
          <Table>
           <Header>
            <Row>
             <HeaderCell>Image</HeaderCell>
             <HeaderCell>Name</HeaderCell>
             <HeaderCell>Description</HeaderCell>
             <HeaderCell>Price in Ether</HeaderCell>
             <HeaderCell>Inventory</HeaderCell>
             <HeaderCell>Auction</HeaderCell>
             {isManager ? <HeaderCell>Edit Item</HeaderCell> :  <HeaderCell>Buy Item</HeaderCell> }
            </Row>
           </Header>
           <Body>{this.state.requests}</Body>
          </Table>
          <div>Found {this.state.requestsCount} Request.</div>
         </Layout>
      );
   }
}

export default RequestIndex;
