import React, { Component } from 'react';
import {Form, Input, Message, Button} from 'semantic-ui-react';
import Orders from '../../lib/getOrders';
import getWeb3 from '../../lib/getWeb3';
import { Router } from '../../routes';

class WithdrawForm extends Component{
 state ={
   value:this.props.value,
   errorMessage:'',
   loading:false,
 };

 onSubmit = async event => {
   event.preventDefault();
   this.setState({loading:true,errorMessage:''});
   try {
     const web3 = await getWeb3()
     const orders = Orders(web3,this.props.address);
     const accounts = await web3.eth.getAccounts()
     await orders.methods.contribute().send({
       from:accounts[0],
       value:web3.utils.toWei(this.state.value,'ether')
     });

     Router.replaceRoute(`/orders/${this.props.address}`);

   }catch(err){
      this.setState({errorMessage:err.message});
   }
   this.setState({loading:false,values:''});
 };

 render(){
   return (
     <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
        <Form.Field>
          <label>Amount to Withdraw</label>
          <Input
            value={this.state.value}
            onChange={event => this.setState({value: event.target.value})}
            label="ether" 
            labelPosition="right"
          />
        </Form.Field>
        <Message error header="Oops!" content={this.state.errorMessage}/>
        <Button primary loading={this.state.loading}>Withdrawng!</Button>
     </Form>
   );
 }
}

export default WithdrawForm
