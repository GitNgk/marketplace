import React, { Component} from 'react'
import Web3Container from '../../lib/Web3Container'
import { Button, Form, Input, Message } from 'semantic-ui-react' 
import Layout from './Layout.js'
import { Link } from '../../routes'

class UpdateContractFactory extends Component {
  state ={
            web3: this.props.web3,
            accounts: this.props.accounts,
            contract: this.props.contract,
            notify:'New Address of Factory',
            newAddress:'',
            storeAddress:'',
  };
  onSubmit = async (event) =>{
     event.preventDefault();

     this.setState({loading:true, errorMessage:''});
     const { web3, accounts, contract, newAddress,storeAddress } = this.state
 
     try {
         const orderAddress = await contract.methods.storeAndOrders(storeAddress).call({from:accounts[0]});
         await contract.methods.updateFactory(storeAddress,orderAddress,newAddress).send({from:accounts[0]});
         this.setState({notify:'Address Changed!'})
      } catch(err){
         this.setState({errorMessage:err.message});
      }
      this.setState({loading:false});
  }

  render() { 
     return (
           <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
            <Form.Field>
             <label>{this.state.notify}</label>
             <Input label="Address"
              labelPosition="right"
              value={this.state.newAddress}
              onChange={event => this.setState({newAddress: event.target.value})}
             />
            </Form.Field>
            <Form.Field>
             <label>Address of Store to change</label>
             <Input label="Address"
              labelPosition="right"
              value={this.state.storeAddress}
              onChange={event => this.setState({storeAddress: event.target.value})}
             />
            </Form.Field>
            <Message error header="Oops!" content={this.state.errorMessage}/>
            <Button primary fluid loading={this.state.loading} >Submit</Button>
           </Form>
     );
  }
}

export default UpdateContractFactory
