import React, { Component} from 'react'
import { Button, Form, Input, Message } from 'semantic-ui-react' 
import Layout from './Layout.js'
import { Link } from '../../routes'

class ChangeRefundTimeForm extends Component {
  state ={
            accounts: this.props.accounts,
            contract: this.props.contract,
            notify: 'Refund Time in days for future stores.',
            newTime:'',
            errorMessage:'',
            loading:false,
  };
  onSubmit = async (event) =>{
     event.preventDefault();

     this.setState({loading:true, errorMessage:''});
     const { accounts, contract, newTime } = this.state
     const timeInSec = newTime *86400 ;
     try {
            await contract.methods.updateRefundTime(timeInSec).send({from:accounts[0]});
            const checkTask = await contract.methods.refundTime().call({from:accounts[0]});
            checkTask == timeInSec ?  this.setState({notify:'Successfull!'}) : 
				this.setState({notify:'Change Failed!'})
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
             <Input label="Time"
              labelPosition="right"
              value={this.state.newTime}
              onChange={event => this.setState({newTime: event.target.value})}
             />
            </Form.Field>
            <Message error header="Oops!" content={this.state.errorMessage}/>
            <Button primary fluid loading={this.state.loading} >Change!</Button>
           </Form>
     );
  }
}

export default ChangeRefundTimeForm
