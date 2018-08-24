import React, { Component } from 'react';
import { Menu } from 'semantic-ui-react';
import { Link } from '../../routes';

export default (props) => {
   var linkTo;
   switch(props.link) {
       case 'create':
          linkTo="store/new";
          break;
       default:
          linkTo:"/"
   }
   return(
      <Menu style={{ marginTop:'10px'}}>
       <Link route="/">
         <a className="item">Market Stores</a>
       </Link>

       <Menu.Menu position="right">
        <Link route={props.link}>
          <a className="item">{props.msg}</a>
        </Link>
       </Menu.Menu>
     </Menu>
   );
};
