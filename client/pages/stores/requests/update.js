import React, { Component } from 'react';
import  { Form, Button, Message, Input,Grid, Divider, Card } from 'semantic-ui-react';
import getWeb3 from '../../../lib/getWeb3'
import getStore from '../../../lib/getStore'
import ipfs from '../../../lib/ipfs'
import { Link, Router } from '../../../routes';
import RenderCards from '../../components/renderCards';
import Layout from '../../components/Layout';

class RequestNew extends Component {
   state ={
      name:'',
      ipfsHash:'',
      value:'',
      description:'',
      inventory:'',
      auction:'',
      loading:false,
      errorMessage:'',
      errorMessageFile:''
   }
 
   static async getInitialProps(props){
      return {
       address: props.query.address,
       sku: props.query.sku
      };
   }

   onSubmit = async (event) => {
      event.preventDefault();
      this.setState({loading:true,errorMessage:''});
     
      const web3 = await getWeb3()
      const store = await getStore(web3, this.props.address)
      const {name, ipfsHash, description, value, inventory, auction} = this.state;
       
      try {
         const accounts = await web3.eth.getAccounts()
         await store.methods.updateItem(
                             this.props.sku,
                             name,
                             ipfsHash,
                             description,
                             web3.utils.toWei(String(value),'ether'),
                             inventory,
                             auction).send({from: accounts[0]});
         Router.pushRoute(`/stores/${this.props.address}/requests`);
      } catch(err){
         this.setState({errorMessage:err.message});
      }
      this.setState({loading:false});
   }

   componentDidMount = async () => {
      const web3 = await getWeb3()
      const store = await getStore(web3, this.props.address)
      const detail = await store.methods.fetchItem(this.props.sku).call()
      this.setState({name:detail.name,
                    description:detail.description,
                    value:detail.price/1e18,
                    inventory:detail.inventory,
                    auction:detail._auction,
                    ipfsHash:detail.ipfsHash})
   }

  onSubmitFile = (event) =>{
     event.preventDefault();
     this.setState({loading:true,errorMeddageFile:''});

     ipfs.files.add(this.state.buffer,(err,result) =>{
        if(err){
          this.setState({errorMeddageFile:err.message});
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
      return <Form onSubmit={this.onSubmitFile} error={!!this.state.errorMeddageFile}>
               <Form.Field>
                  <label>Change Image</label>
                  <Input type='file' action='upload' 
                     onChange={this.captureFile}
                  />
               </Form.Field>
               <Message error header="Oops!" content={this.state.errorMeddageFile } />
             </Form>
   }

   render(){
     const {ipfsHash,name,value,inventory,description,auction} = this.state;
     const image=ipfsHash
     const header=name
     const meta=value+' (Ether)'
     const desc=description
     const extra='Stock: '+ inventory
     const isAuction = /^0x0+$/.test(auction)
console.log('NGK ',isAuction)
     return (
        <Layout msg='Store Listings' link={`/stores/${this.props.address}/requests`}>
             <Link route={`/stores/${this.props.address}/requests`}>
               <a> Back </a>
              </Link>
              <Grid columns={2} relaxed>
                 <Grid.Column>
                  <RenderCards
                     ipfsHash={ipfsHash}
                     header={header}
                     meta={meta}
                     description={desc}
                     extra={extra}
                  />
                 <Divider horizontal></Divider>
                  {!isAuction ? (<Link route={`/stores/${auction}/requests/${this.props.sku}/bid`}>
                    <a> <Button color="blue" basic>Bid Page</Button></a> 
                   </Link>) : ''}
                 </Grid.Column>
                 <Divider vertical></Divider>
                 <Grid.Column>
                    <h3>Make Changes</h3>
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
                  <label>Entry Manually Created Auction</label>
                  <Input
                     value={this.state.auction}
                     onChange={event => this.setState({auction:event.target.value})}
                  />
               </Form.Field>
               <Message error header="Oops!" content={this.state.errorMessage } />
               <Button primary fluid loading={this.state.loading}>Update</Button>
             </Form>
    </Grid.Column>
    </Grid>
        </Layout>
     )
   }
}

export default RequestNew;
