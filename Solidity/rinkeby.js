const HDWalletProvider = require('@truffle/hdwallet-provider');
const truffle = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
//importing abi and bytecode of Crowdfunding Events Contract
const CrowdFundingEventsContract = require('../Solidity/compiled_contracts/CrowdfundingEvents.json');
const crowdfundingEventsContract = {
    interface: CrowdFundingEventsContract.contracts['CrowdfundingEvents.sol']['CrowdfundingEvents'].abi,
    bytecode: CrowdFundingEventsContract.contracts['CrowdfundingEvents.sol']['CrowdfundingEvents'].evm.bytecode.object
};
const crowdfundingEventContract = {
    interface: CrowdFundingEventsContract.contracts['CrowdfundingEvents.sol']['CrowdfundingEvent'].abi,
    bytecode: CrowdFundingEventsContract.contracts['CrowdfundingEvents.sol']['CrowdfundingEvent'].evm.bytecode.object
};

const wallet = new HDWalletProvider(
'lizard table distance moon stage champion person air discover cave army concert',
'https://rinkeby.infura.io/v3/0fea43cd4e7541c78c1967a263e7189d'
);

const web3 = new Web3(wallet);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();
    console.log(accounts);

    // deploy ethereum contract to rinkeby ethereum network
    var crowdfundingEventsContract_instance = await new web3.eth
        .Contract(crowdfundingEventsContract.interface)
        .deploy({ data: crowdfundingEventsContract.bytecode, arguments: ['AJ Hybrid DAO Crowdfunding'] })
        .send({ from: accounts[0], gas: '4000000' });
    console.log(crowdfundingEventsContract_instance.options.address);

    wallet.engine.stop();
};
deploy();