import React, { Component } from 'react';
import { Table, Button,Image } from 'semantic-ui-react';
import { Link } from '../../routes'

class RequestRow extends Component {
  render(){
     const { Row, Cell} = Table;
     const { id, request, approversCount, isManager, address} = this.props;
     const readyToFinalize = request.approvalCount > approversCount/2;
     const emptyAddress = /^0x0+$/.test(request._auction);
     return (
         <Row disabled={request.complete} positive={readyToFinalize && !request.complete}>
          <Cell>
            <Image size='mini' src={`https://ipfs.io/ipfs/${request.ipfsHash}`} /> 
          </Cell>
          <Cell>{request.name}</Cell>
          <Cell>{request.description}</Cell>
          <Cell>{request.price/1e18}</Cell>
          <Cell>{request.inventory}</Cell>
          { emptyAddress ? <Cell>Not Auctioned</Cell> : <Cell>{request._auction}</Cell>}
          <Cell>
            {isManager ? (
               <Link route={`/stores/${this.props.address}/requests/${id}/update`}>
                   <a> <Button color="teal" basic>Update</Button></a> 
               </Link>
             )
             :(
               !emptyAddress ? (
               <Link route={`/stores/${request._auction}/requests/${id}/bid`}>
                   <a> <Button color="blue" basic>Bid</Button></a> 
               </Link>) :(
               <Link route={`/stores/${this.props.address}/requests/${id}/buy`}>
                   <a> <Button color="green" basic>Buy</Button></a> 
               </Link>) 
            )}
          </Cell>
        </Row>
      )
  }
}

export default RequestRow;
