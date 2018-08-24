import Web3 from 'web3'

let web3;
const alreadyInjected = typeof web3 !== 'undefined' // i.e. Mist/Metamask
const localProvider = `http://localhost:8545`

if (alreadyInjected && typeof window.web3 !=='undefined') {
   console.log(`Injected web3 detected.`)
   web3 = new Web3(web3.currentProvider)
} else {
   console.log(`No web3 instance injected, using Local web3.`)
   const provider = new Web3.providers.HttpProvider(localProvider)
   web3 = new Web3(provider)
}

export default web3;
