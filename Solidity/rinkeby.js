const HDWalletProvider = require('@truffle/hdwallet-provider');
const truffle = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const contract = require('./compiled_contracts/lottery.json');

const wallet = new HDWalletProvider(
'lizard table distance moon stage champion person air discover cave army concert',
'https://rinkeby.infura.io/v3/0fea43cd4e7541c78c1967a263e7189d'
);

const web3 = new Web3(wallet);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();
    console.log(accounts);

    contract_instance = await new web3.eth.Contract(contract.contracts['lottery.sol']['Lottery'].abi)
        .deploy({data: contract.contracts['lottery.sol']['Lottery'].evm.bytecode.object})
        .send( {from: accounts[0], gas: '1000000'});
    console.log(contract_instance.options.address);
    wallet.engine.stop();
};
deploy();