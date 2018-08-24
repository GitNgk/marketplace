import React, { Component } from 'react';
import  { Form, Button, Message, Input,Grid, Segment, Divider, Card } from 'semantic-ui-react';
import getWeb3 from '../../../lib/getWeb3'
import getStore from '../../../lib/getStore'
import getAuction from '../../../lib/getAuction'
import { Link, Router } from '../../../routes';
import Layout from '../../components/Layout';
import BuyForm from '../../components/buyForm';
import RenderCards from '../../components/renderCards';

class RequestNew extends Component {
   state ={
      web3:'',
      auction:'',
      storeAddress:'',
      sku:'',
      name:'',
      ipfsHash:'',
      value:'',
      description:'',
      inventory:'',
      highestBid:'',
      highestBidder:'',
      auctionEnd:'',
      yourBid:'',
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
      const auction = await getAuction(web3, this.props.address)
      const storeAddress = await auction.methods.store().call()
      const highestBid = await auction.methods.highestBid().call()
      const highestBidder = await auction.methods.highestBidder().call()
      const auctionEnd = await auction.methods.auctionEndVar().call()
      const store = await getStore(web3, storeAddress)
      const detail = await store.methods.fetchItem(this.props.sku).call()
      this.setState({web3:web3,
		     auction:auction,
                     storeAddress:storeAddress,
                     sku:detail.sku,
                     name:detail.name,
                     description:detail.description,
                     value:detail.price/1e18,
                     inventory:detail.inventory,
                     ipfsHash:detail.ipfsHash,
                     highestBid:highestBid/1e18,
                     highestBidder:highestBidder,
                     auctionEnd:auctionEnd
                    })
   }

  timeConverter(UNIX_timestamp){
     var a = new Date(UNIX_timestamp * 1000);
     var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
     var year = a.getFullYear();
     var month = months[a.getMonth()];
     var date = a.getDate();
     var hour = a.getHours();
     var min = a.getMinutes();
     var sec = a.getSeconds();
     var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
     return time;
  } 

   onSubmit = async (event) => {
      event.preventDefault();
      const { web3, auction,sku,yourBid } = this.state
      this.setState({loading:true,errorMessage:''});

      try {
         const accounts = await web3.eth.getAccounts()

         await auction.methods.bid().send({
                     from:accounts[0],
                     value:web3.utils.toWei(String(yourBid),'ether')
                     });
         Router.pushRoute(`/stores/${this.props.address}/requests/${sku}/bid`);
      } catch(err){
         this.setState({errorMessage:err.message});
      }
      this.setState({loading:false});
   }

   onClick = async () =>{
      this.setState({loading:true,errorMessage:''});
      try {
         const {web3, auction} = this.state
         const accounts = await web3.eth.getAccounts()

         await auction.methods.withdraw().send({from:accounts[0],gas:39000})
      } catch(err){
         this.setState({errorMessage:err.message});
      }
      this.setState({loading:false});
   }
   onClickEnd = async () =>{
      this.setState({loading:true,errorMessage:''});
      try {
         const {web3, auction} = this.state
         const accounts = await web3.eth.getAccounts()

         await auction.methods.auctionEnd().send({from:accounts[0]})
      } catch(err){
         this.setState({errorMessage:err.message});
      }
      this.setState({loading:false});
   }
   render(){
     const {ipfsHash,name,value,inventory,description,highestBid,highestBidder,storeAddress} = this.state;
     const date = this.timeConverter(this.state.auctionEnd);
     const header=name+': '+description
     const meta= value + '(Minimum to win bid in Ether) for: '+ inventory
     const desc='Auction Ends: '+ date
     const extra= 'Current highest Bid: '+highestBid+' Winning Address: '+ highestBidder
     return (
        <Layout msg="Store Listing" link={`/stores/${storeAddress}/requests`}>
             <Link route={`/stores/${storeAddress}/requests`}>
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
                    <h3>Bidding Page for {this.state.name}</h3>
                    <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
                       <Form.Field>
             <label>Placing bid: {this.state.yourBid}</label>
             <Input label="Ether"
              labelPosition="right"
              value={this.state.yourBid}
              onChange={event => this.setState({yourBid: event.target.value})}
              />
                       </Form.Field>
                       <Message error header="Oops!" content={this.state.errorMessage}/>
                       <Button primary fluid loading={this.state.loading} >Submit</Button>
                     </Form>
                  </Grid.Column>
                  <Grid.Column>
              <Button primary onClick={this.onClick}>Withdraw</Button>
              <Button primary onClick={this.onClickEnd}>End Auction</Button>
                  </Grid.Column>
               </Grid>
          </Layout>
     )
   }
}

export default RequestNew;
