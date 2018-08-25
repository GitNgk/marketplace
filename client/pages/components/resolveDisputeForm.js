import React, { Component} from 'react'
import Web3Container from '../../lib/Web3Container'
import { Button, Form, Input, Message } from 'semantic-ui-react' 
import Layout from './Layout.js'
import { Link } from '../../routes'

class ResolveDispute extends Component {
  state ={
            web3: this.props.web3,
            accounts: this.props.accounts,
            contract: this.props.contract,
            notify:'Resolve Refund Dipute',
            orderId:'',
            winnersAddress:'',
            storeAddress:'',
            errorMessage:'',
            loading:false,
  };
  onSubmit = async (event) =>{
     event.preventDefault();

     this.setState({loading:true, errorMessage:''});
     const { web3, accounts, contract, orderId,storeAddress,winnersAddress } = this.state
 
     try {
         await contract.methods.resolveDispute(orderId,storeAddress,winnersAddress).send({from:accounts[0]});
         this.setState({notify:winnerAddress+ 'Can now withdraw from Order!'})
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
             <Input label="Order No."
              labelPosition="right"
              value={this.state.orderId}
              onChange={event => this.setState({orderId: event.target.value})}
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
            <Form.Field>
             <label>Address of Manager or Buyer to refund or reject</label>
             <Input label="Address"
              labelPosition="right"
              value={this.state.winnersAddress}
              onChange={event => this.setState({winnersAddress: event.target.value})}
             />
            </Form.Field>
            <Message error header="Oops!" content={this.state.errorMessage}/>
            <Button primary fluid loading={this.state.loading} >Submit</Button>
           </Form>
     );
  }
}

export default ResolveDispute
