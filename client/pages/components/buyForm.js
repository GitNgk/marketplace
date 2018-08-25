import React, { Component} from 'react'
import Web3Container from '../../lib/Web3Container'
import { Button, Form, Input, Message } from 'semantic-ui-react' 
import Layout from './Layout.js'
import { Link } from '../../routes'

class BuyForm extends Component {
  state ={
            inventory: this.props.inventory,
            notify:'Buy',
            quantity:'',
            value:'',
            errorMessage:'',
            loading:false,
  };
  onSubmit = async (event) =>{
     event.preventDefault();

     this.setState({loading:true, errorMessage:''});
     const { web3, accounts, contract } = this.props
 
     try {
        if (action) {
            await contract.methods.buyItem(action).send({from:accounts[0]});
            const checkTask = await contract.methods.adminStaff(newAddress).call({from:accounts[0]});
            this.setState({notify:'Failed to Add!'})
        } else {
            throw new Error('Must Choose action [Add|Remove]') 
        }
      } catch(err){
         this.setState({errorMessage:err.message});
      }
      this.setState({loading:false});
  }

  render() { 
    
    const options = Array(10).fill().map((element,index) =>{ 
           return ({ key: index+1, text:index+1, value: index+1 }
          )});
     return (
           <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
               <Form.Field>
                  <label>Amount</label>
                  <Form.Select options={options} placeholder='Amount'
                   onChange={(event,{value}) => this.setState({action:value})}
                  />
               </Form.Field>
            <Message error header="Oops!" content={this.state.errorMessage}/>
            <Button primary fluid loading={this.state.loading} >Submit</Button>
           </Form>
     );
  }
}

export default BuyForm
