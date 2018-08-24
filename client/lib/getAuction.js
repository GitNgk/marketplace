import contractDefinition from './contracts/Auction.json'

const getAuctionInstance = (web3, address) => {
  // create the instance
  const instance = new web3.eth.Contract(
    contractDefinition.abi,
    address
  )
  return instance
}

export default getAuctionInstance
