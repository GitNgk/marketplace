import React, { Component} from 'react'
import Web3Container from '../../lib/Web3Container'
import { Button, Form, Input, Message } from 'semantic-ui-react' 
import Layout from './Layout.js'
import { Link } from '../../routes'

class UpdateContractForm extends Component {
  state ={
            web3: this.props.web3,
            accounts: this.props.accounts,
            contract: this.props.contract,
            notify:'New Address',
            action:'',
            newAddress:'',
            currentAddress:'',
            errorMessage:'',
            loading:false,
  };
  onSubmit = async (event) =>{
     event.preventDefault();

     this.setState({loading:true, errorMessage:''});
     const { web3, accounts, contract, action,currentAddress, newAddress } = this.state
 
     try {
        if (action=='store') {
            await contract.methods.updateStore(currentAddress,newAddress).send({from:accounts[0]});
            this.setState({notify:'Address Changed!'})
        } else if( action =='orders'){
            await contract.methods.updateOrders(currentAddress,newAddress).send({from:accounts[0]});
            this.setState({notify:'Address Changed!'})
        } else {
            throw new Error('Must Choose action [Add|Remove]') 
        }
      } catch(err){
         this.setState({errorMessage:err.message});
      }
      this.setState({loading:false});
  }

  render() { 
    const options = [
           { key: 's', text: 'Change Store', value: 'store' },
           { key: 'o', text: 'Change Orders', value: 'orders' },
          ]
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
             <label>Store or Orders contract where change will be made.</label>
             <Input label="Address"
              labelPosition="right"
              value={this.state.currentAddress}
              onChange={event => this.setState({currentAddress: event.target.value})}
             />
            </Form.Field>
               <Form.Field>
                  <label>Option</label>
                  <Form.Select options={options} placeholder='Store/Orders'
                   onChange={(event,{value}) => this.setState({action:value})}
                  />
               </Form.Field>
            <Message error header="Oops!" content={this.state.errorMessage}/>
            <Button primary fluid loading={this.state.loading} >Submit</Button>
           </Form>
     );
  }
}

export default UpdateContractForm
