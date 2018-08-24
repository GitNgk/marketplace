import React, { Component } from 'react';
import { Table, Button } from 'semantic-ui-react';
import { Link } from '../../routes'

class OrdersRow extends Component {

  timeConverter(UNIX_timestamp){
     var a = new Date(UNIX_timestamp * 1000);
     var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
     var year = a.getFullYear();
     var month = months[a.getMonth()];
     var date = a.getDate();
     var hour = a.getHours();
     var min = a.getMinutes();
     var sec = a.getSeconds();
     var time = date + ' ' + month + ' ' + year +'('+hour+':'+min+')';
     return time;
  } 

  render(){
     const { Row, Cell} = Table;
     const {id,request,ordersAddress} = this.props;
     const emptyAddress = /^$/.test(request.deliver);
     
     const state=['Sold','DeliveryAddress','Shipped','Received','Refund','Approved','Rejected','Complete']
     const date = this.timeConverter(request.date);
     return (
         <Row>
          <Cell>{request.orderId}</Cell>
          <Cell>{request.item}</Cell>
          <Cell>{request.price/1e18}</Cell>
          { emptyAddress ? <Cell>Delivery information required</Cell> : <Cell>{request.deliver}</Cell>}
          <Cell>{request.quantity}</Cell>
          <Cell>{date}</Cell>
          <Cell>{state[request.state]}</Cell>
          <Cell>
          <Link route={`/orders/${this.props.ordersAddress}/requests/${request.item}/${request.orderId}/update`}>
            <a> <Button color="teal" basic>Update</Button></a> 
          </Link>
          </Cell>
        </Row>
      )
  }
}

export default OrdersRow;
