import React, { Component} from 'react'
import Web3Container from '../../lib/Web3Container'
import Layout from '../components/Layout'
import { Form, Button, Input, Message } from 'semantic-ui-react'
import { Router } from '../../routes';

class StoreNew extends Component {

   state = {storeName:undefined,
            errorMessage:'',
            loading:false,
           };

   onSubmit = async (event) => {
      event.preventDefault();
      const { accounts, contract } = this.props
      this.setState({loading:true, errorMessage:''});

      try {
         await contract.methods
              .createStore(this.state.storeName)
              .send({
              from:accounts[0]
              });
         Router.pushRoute('/');
      } catch (err){
         this.setState({errorMessage: err.message });
      }
      this.setState({ loading:false });
   };
   render(){

      return (
         <Layout msg="Home Page" link="/">
           <h3>New Store</h3>
           <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
            <Form.Field>
             <label>Store Name</label>
             <Input label="Name"
              labelPosition="right"
              value={this.state.storeName}
              onChange={event => this.setState({storeName: event.target.value})}
             />
            </Form.Field>
            <Message error header="Oops!" content={this.state.errorMessage}/>
            <Button loading={this.state.loading} primary>Create!</Button>
           </Form>
         </Layout>
      );
   }
}
export default () => (
  <Web3Container
    renderLoading={() => <div>Loading StoreFact Page...</div>}
    render={({ web3, accounts, contract }) => (
      <StoreNew accounts={accounts} contract={contract} web3={web3} />
    )}
  />
)
