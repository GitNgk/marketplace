import React, { Component } from 'react';
import  { Form, Button, Message, Input,Grid, Segment, Divider, Card } from 'semantic-ui-react';
import getWeb3 from '../../../lib/getWeb3'
import getStore from '../../../lib/getStore'
import { Link, Router } from '../../../routes';
import Layout from '../../components/Layout';
import BuyForm from '../../components/buyForm';
import RenderCards from '../../components/renderCards';

class RequestNew extends Component {
   state ={
      web3:'',
      store:'',
      accounts:'',
      sku:'',
      name:'',
      ipfsHash:'',
      value:'',
      quantity:'',
      description:'',
      inventory:'',
      auction:'',
      loading:false,
      errorMessage:''
   }
 
   static async getInitialProps(props){
      return {
       address: props.query.address,
       sku: props.query.sku
      };
   }

   componentDidMount = async () => {
      const web3 = await getWeb3()
      const store = await getStore(web3, this.props.address)
      const detail = await store.methods.fetchItem(this.props.sku).call()
      this.setState({web3:web3,
		     store:store,
                     sku:detail.sku,
                     name:detail.name,
                     ipfsHash:detail.ipfsHash,
                     description:detail.description,
                     value:detail.price/1e18,
                     inventory:detail.inventory,
                     auction:detail._auction
                    })
   }

   onSubmit = async (event) => {
      event.preventDefault();
      const { web3, accounts, store,sku,quantity } = this.state
      const total = this.state.value * quantity;
      this.setState({loading:true,errorMessage:''});

      try {
       if(quantity){
          const accounts = await web3.eth.getAccounts()
          await store.methods.buyItem(sku,quantity).send({
                      from:accounts[0],
                      value:web3.utils.toWei(String(total),'ether')
                      });
          Router.pushRoute(`/stores/${this.props.address}/requests`);
       } else{
            throw new Error('Must Choose quantity') 
        }
      } catch(err){
         this.setState({errorMessage:err.message});
      }
      this.setState({loading:false});
   }

   render(){
     const {ipfsHash,name,value,inventory,description,highestBid} = this.state;
     const header=name
     const meta= value + '(Minimum to win bid in Ether) for: '+ inventory
     const desc=description
     const extra= 'Address:' +this.state.auction
     const options = Array(10).fill().map((element,index) =>{ 
           return ({ key: index+1, text:index+1, value: index+1 }
          )});
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
                     meta= {meta}
                     description={desc}
                     extra= {extra}
                  />
                 </Grid.Column>
                 <Divider vertical></Divider>
                 <Grid.Column>
                    <h3>Make Changes</h3>
                    <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
                       <Form.Field>
                          <label>Amount</label>
                          <Form.Select options={options} placeholder='Amount'
                             onChange={(event,{value}) => this.setState({quantity:value})}
                           />
                       </Form.Field>
                       <Message error header="Oops!" content={this.state.errorMessage}/>
                       <Button primary fluid loading={this.state.loading} >Submit</Button>
                     </Form>
                  </Grid.Column>
               </Grid>
          </Layout>
     )
   }
}

export default RequestNew;
