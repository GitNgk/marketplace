import React, { Component} from 'react'
import Web3Container from '../../lib/Web3Container'
import { Button, Form, Input, Message } from 'semantic-ui-react' 
import Layout from './Layout.js'
import { Link } from '../../routes'

class AddRemoveAdminForm extends Component {
  state ={
            web3: this.props.web3,
            accounts: this.props.accounts,
            contract: this.props.contract,
            notify:'Address',
            action:'',
            newAddress:'',
            errorMessage:'',
            loading:false,
  };
  onSubmit = async (event) =>{
     event.preventDefault();

     this.setState({loading:true, errorMessage:''});
     const { web3, accounts, contract, action, newAddress } = this.state
 
     try {
        if (action=='add') {
            await contract.methods.addAdminStaff(newAddress).send({from:accounts[0]});
            const checkTask = await contract.methods.adminStaff(newAddress).call({from:accounts[0]});
            checkTask ?  this.setState({notify:'Successfull!'}) :
                                this.setState({notify:'Failed to Add!'})
        } else if( action =='remove'){
            
            await contract.methods.delAdminStaff(newAddress).send({from:accounts[0]});
            const checkTask = await contract.methods.adminStaff(newAddress).call({from:accounts[0]});
            checkTask ?  this.setState({notify:'Failed to Remove!'}) :
                                this.setState({notify:'Successfull!'})
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
           { key: 'a', text: 'Add', value: 'add' },
           { key: 'r', text: 'Remove', value: 'remove' },
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
                  <label>Option</label>
                  <Form.Select options={options} placeholder='Add/Remove'
                   onChange={(event,{value}) => this.setState({action:value})}
                  />
               </Form.Field>
            <Message error header="Oops!" content={this.state.errorMessage}/>
            <Button primary fluid loading={this.state.loading} >Submit</Button>
           </Form>
     );
  }
}

export default AddRemoveAdminForm
