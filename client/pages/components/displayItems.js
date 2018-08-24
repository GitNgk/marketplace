import React from 'react'
import { Image, Item } from 'semantic-ui-react'

const DisplayItems = (props) => (
  <Item.Group>
    <Item>
      <Item.Image size='tiny' src={`https://ipfs.io/ipfs/${props.ipfsHash}`} alt="" />

      <Item.Content>
        <Item.Header as='a'>Title: {props.name}</Item.Header>
        <Item.Meta>Description</Item.Meta>
        <Item.Description>
         {props.description} 
        </Item.Description>
        <Item.Extra>{props.value}</Item.Extra>
      </Item.Content>
    </Item>
  </Item.Group>
)

export default DisplayItems
