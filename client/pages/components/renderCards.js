import React, {Component} from 'react'
import { Card } from 'semantic-ui-react'

class RenderCards extends Component {
 render() {
  const item =  [{
     image: 'https://ipfs.io/ipfs/'+this.props.ipfsHash,
      header: this.props.header,
      meta: this.props.meta,
      description: this.props.description,
      extra: this.props.extra,
      style: { overflowWrap: 'break-word'} 
    },]
   return  <Card.Group items={item}/>
 }
}


export default RenderCards
