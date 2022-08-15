// create ganache local instance for unit testing
const ganache = require('ganache');

// create web3 instance with above ganache instance
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

//assert for comparing expected output and generated output of mocha tests
const assert = require('assert');

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

var ganache_acnts; // variable to load ethereum accounts from local network for unit testing
var contract_instance;  // load contract address from local ethereum network

// deploying contract to ganache local ethereum network
beforeEach(async () => {
    // load all ganache accounts
    ganache_acnts = await web3.eth.getAccounts();

    // deploy ethereum contract to ganache local ethereum network
    contract_instance = await new web3.eth.Contract(crowdfundingEventsContract.interface)
        .deploy({data: crowdfundingEventsContract.bytecode, arguments: ['AJ Hybrid DAO Crowdfunding']})
        .send( {from: ganache_acnts[0], gas: '3000000'});
});


describe('CrowdFundingEvents unit testing',  () => {
    it('CrowdFundingEvents contract deployment success test', async () => {
        var eventAdmin = await contract_instance.methods.crowdfunding_admin().call()
        // checkcing if contract creator is set as admin in the contract
        assert.equal(eventAdmin, ganache_acnts[0]);
    });
    it('Load Crowdfunding event address and manager address to Add Funding Event method', async () => {
        await contract_instance.methods
            .CreateCrowdfundingEvent('Event1','Event1 content',10000000)
            .send({from: ganache_acnts[0], gas: '3000000'});
        var crowdfundingEvents = await contract_instance.methods.GetCrowdfundingEvents().call();
        console.log(crowdfundingEvents);
        console.log(ganache_acnts[0]);
    });
});


