import React, { Component} from 'react'
import Web3Container from '../../lib/Web3Container'
import { Button, Form, Input, Message } from 'semantic-ui-react' 
import Layout from './Layout.js'
import { Link } from '../../routes'

class WithdrawStopStartForm extends Component {
  state ={
            web3: this.props.web3,
            accounts: this.props.accounts,
            contract: this.props.contract,
            notify:'Stop/Start Order creation and money transfer!',
            ordersAddress:'',
            errorMessage:'',
            loading:false,
  };
  onSubmit = async (event) =>{
     event.preventDefault();

     this.setState({loading:true, errorMessage:''});
     const { web3, accounts, contract, ordersAddress } = this.state
 
     try {
         await contract.methods.stopStartWithdrawals(ordersAddress).send({from:accounts[0]});
         this.setState({notify:'Stop/Start - Status Changed for: ' + ordersAddress})
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
              value={this.state.ordersAddress}
              onChange={event => this.setState({ordersAddress: event.target.value})}
             />
            </Form.Field>
            <Message error header="Oops!" content={this.state.errorMessage}/>
            <Button primary fluid loading={this.state.loading} >Submit</Button>
           </Form>
     );
  }
}

export default WithdrawStopStartForm
