import React, { Component } from 'react';
import  { Form, Button, Message, Input, Grid } from 'semantic-ui-react';
import getWeb3 from '../../../lib/getWeb3'
import getStore from '../../../lib/getStore'
import ipfs from '../../../lib/ipfs'
import { Link, Router } from '../../../routes';
import DisplayItems from '../../components/displayItems';
import Layout from '../../components/Layout';

class RequestNew extends Component {
   state ={
      value:'',
      name:'',
      ipfsHash:'',
      buffer:'',
      description:'',
      inventory:'',
      auction:'',
      time:'',
      loading:false,
      errorMessage:'',
      errorMessageFile:''
   }
 
   static async getInitialProps(props){
      return {
       address: props.query.address
      };
   }

   onSubmit = async (event) => {
      event.preventDefault();
      this.setState({loading:true,errorMessage:''});

      const web3 = await getWeb3()
      const store = await getStore(web3, this.props.address)
      const {name, description, value, inventory, auction,time, ipfsHash} = this.state;

      try {
         if(ipfsHash) {
            const accounts = await web3.eth.getAccounts()

            await store.methods.addItem(
               name,
               ipfsHash,
               description,
               web3.utils.toWei(value,'ether'),
               inventory,
               auction,
               time*86400).send({from: accounts[0]})

            Router.pushRoute(`/stores/${this.props.address}/requests`);
         } else {
            throw new Error('Must upload and Image of item') 
         } 
      } catch(err){
         this.setState({errorMessage:err.message});
      }
      this.setState({loading:false});
   }

  onSubmitFile = (event) =>{
     event.preventDefault();
     this.setState({loading:true,errorMessageFile:''});
     ipfs.files.add(this.state.buffer,(err,result) =>{
        if(err){
          this.setState({errorMessageFile:err.message});
          return;
        }
        this.setState({ipfsHash:result[0].hash})
     })
     this.setState({loading:false});
   }

   captureFile = (event) => {
     event.preventDefault();
     const file = event.target.files[0];
     const reader = new window.FileReader();
     reader.readAsArrayBuffer(file)
     reader.onloadend = () => {
        this.setState({buffer:Buffer(reader.result)})
     }
   }

   uploadImageForm = () => {
      return <Form onSubmit={this.onSubmitFile} error={!!this.state.errorMessageFile}>
               <Form.Field>
                  <label>Change Image</label>
                  <Input type='file' action='upload' 
                     onChange={this.captureFile}
                  />
               </Form.Field>
               <Message error header="Oops!" content={this.state.errorMessageFile } />
             </Form>
   }

   render(){
    const options = [
           { key: 'd', text: 'Disable', value: 0 },
           { key: 'a', text: 'Activate', value: 1 },
          ]

     return (
        <Layout msg="Store Listings" link={`/stores/${this.props.address}/requests`}>
  <Grid columns='two' divided>
    <Grid.Row>
      <Grid.Column>
       <DisplayItems
          name={this.state.name}
          description= {this.state.description}
          value={this.state.value+'(Ether)'}
          ipfsHash={this.state.ipfsHash}
       />
      </Grid.Column>
      <Grid.Column>
             <Link route={`/stores/${this.props.address}/requests`}>
               <a> Back </a>
              </Link>
             <h3>Create A Product for Sale</h3>
              {this.uploadImageForm()}
             <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
               <Form.Field>
                  <label>Name</label>
                  <Input 
                     value={this.state.name}
                     onChange={event => this.setState({name:event.target.value})}
                  />
               </Form.Field>
               <Form.Field>
                  <label>Description</label>
                  <Input 
                     value={this.state.description}
                     onChange={event => this.setState({description:event.target.value})}
                  />
               </Form.Field>

               <Form.Field>
                  <label>Value in Ether</label>
                  <Input
                     value={this.state.value}
                     onChange={event => this.setState({value:event.target.value})}
                  />
               </Form.Field>

               <Form.Field>
                  <label>Inventory Amount</label>
                  <Input
                     value={this.state.inventory}
                     onChange={event => this.setState({inventory:event.target.value})}
                  />
               </Form.Field>
               <Form.Field>
                  <label>Activate as Auction</label>
                  <Form.Select options={options} placeholder='Auction' 
                     onChange={(event,{value}) => this.setState({auction:value})}
                  />
               </Form.Field>
               <Form.Field>
                  <label>Auction Ending Time in day units</label>
                  <Input
                     value={this.state.time}
                     onChange={event => this.setState({time:event.target.value})}
                  />
               </Form.Field>
               <Message error header="Oops!" content={this.state.errorMessage } />
               <Button primary loading={this.state.loading}>Create!</Button>
             </Form>
      </Grid.Column>
    </Grid.Row>
  </Grid>
      </Layout>
     )
   }
}

export default RequestNew;
