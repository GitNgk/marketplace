import contractDefinition from './contracts/Store.json'

const getStoreInstance = (web3, address) => {
  // create the instance
  const instance = new web3.eth.Contract(
    contractDefinition.abi,
    address
  )
  return instance
}

export default getStoreInstance
