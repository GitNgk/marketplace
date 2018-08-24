import contractDefinition from './contracts/Orders.json'

const getOrdersInstance = (web3, address) => {
  // create the instance
  const instance = new web3.eth.Contract(
    contractDefinition.abi,
    address
  )
  return instance
}

export default getOrdersInstance
