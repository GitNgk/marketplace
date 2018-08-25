# Next.js client

This is the frontend client for our dapp. It is built with Next.js and uses a render-prop pattern (via `lib/Web3Container.js`) so we can easily inject blockchain functionality (i.e. web3, accounts, and the contract instance) into each page.

## Pages

There re three pages:

- `index.js` — This is the landing page.

## The `lib` folder

### `contracts`

A symlink to the `build/contracts` located in the Truffle project is placed here so that the Next.js app can refer to the build artifacts from the parent Truffle project.

### `Web3Container.js`

This is a component that utilizes the render-prop pattern to inject `web3`, `accounts`, and `contract` instance objects into a given function. When these objects are loading, it will render a loading function that is expected to return a React component.

For an example of how to use it, please see the `accounts` and `dapp` pages.

You may want to modify this for your own purposes. For example, you can require multiple contracts if your dapp requires it.

### `getWeb3.js`

This is a function for actually getting the Web3 object. Unfortunately, this file is not as straight-forward as I would have liked it. Your best bet at understanding this is to read the comments I have written in the file. You probably don't need to change anything in this file.

### `getContract.js`

This function requires `web3` to be passed in. It uses `truffle-contract` to initialize and return a contract instance `Factory.sol`. This function is used by `Web3Container.js`. You probably don't need to change anything in this file.

### `getStore.js`

This function requires `web3` to be passed in. It uses `truffle-contract` to initialize and return a contract instance for `Store.sol`.

### `getOrders.js`

This function requires `web3` to be passed in. It uses `truffle-contract` to initialize and return a contract instance for `Orders.sol`.

### `getAuction.js`

This function requires `web3` to be passed in. It uses `truffle-contract` to initialize and return a contract instance for `Auction.sol`.

### `getAccounts.js`

This simply wraps `web3.eth.getAccounts` into a Promise so we can use it cleanly inside `Web3Container.js`. You probably don't need to change anything in this file.

### `ipfs.js`

This sets up the connection to infura.io ipfs API server
