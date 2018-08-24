import React, { Component} from 'react'
import getWeb3 from '../../lib/getWeb3'
import { Button, Form, Input, Message } from 'semantic-ui-react' 
import Layout from './Layout.js'
import { Link } from '../../routes'

class ManageOrderForm extends Component {
  state ={
            notify:'Deliver To This Address',
            state:'',
            newAddress:'',
      loading:false,
      errorMessage:''
  };

  onSubmit = async (event) =>{
     event.preventDefault();

     this.setState({loading:true, errorMessage:''});
     const { state, newAddress } = this.state
     const { accounts, contract, id } = this.props
     const web3 = await getWeb3()
 
     try {
        if (state=='1') {
            //await contract.methods.updateAddress(id,web3.utils.utf8ToHex(newAddress)).send({from:accounts[0]});
            await contract.methods.updateAddress(id,newAddress).send({from:accounts[0]});
        } else if( state =='2'){
            await contract.methods.shipItem(id).send({from:accounts[0]});
        } else if( state =='3'){
            await contract.methods.receiveItem(id).send({from:accounts[0]});
        } else if( state =='4'){
            await contract.methods.requestRefund(id).send({from:accounts[0]});
        } else if( state =='5'){
            await contract.methods.approveRefund(id).send({from:accounts[0]});
        } else {
            throw new Error('Must Choose status to update') 
        }
      } catch(err){
         this.setState({errorMessage:err.message});
      }
      this.setState({loading:false});
  }

  render() {
    var options =[]
    const {isManager} = this.props;
    isManager ? ( 
       options = [
           { key: 's', text: 'Ship', value: '2' },
           { key: 'a', text: 'Approve Refund', value: '5' },
          ] ) : (
       options = [
           { key: 'd', text: 'DeliveryAddress', value: '1' },
           { key: 's', text: 'Recieved', value: '3' },
           { key: 'rf', text: 'Refund Request', value: '4' },
          ] )
     return (
           <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
            {(!isManager ) ? (
             <Form.Field>
              <label>{this.state.notify}</label>
              <Input label="Address"
               labelPosition="right"
               value={this.state.newAddress}
               onChange={event => this.setState({newAddress: event.target.value})}
              />
             </Form.Field>) : ("") }
               <Form.Field>
                  <label>Option</label>
                  <Form.Select options={options} placeholder='Update Status'
                   onChange={(event,{value}) => this.setState({state:value})}
                  />
               </Form.Field>
            <Message error header="Oops!" content={this.state.errorMessage}/>
            <Button primary fluid loading={this.state.loading} >Submit</Button>
           </Form>
     );
  }
}

export default ManageOrderForm
