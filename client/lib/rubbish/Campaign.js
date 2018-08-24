import web3 from './Web3C'
import contractDefinition from './contracts/Campaign.json'

export default (address) => {
   return new web3.eth.Contract(contractDefinition.abi,address)
};
