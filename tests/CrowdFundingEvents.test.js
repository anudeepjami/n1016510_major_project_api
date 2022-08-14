// create ganache local instance for unit testing
const ganache = require('ganache');

// create web3 instance with above ganache instance
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

//assert for comparing expected output and generated output of mocha tests
const assert = require('assert');

//importing abi and bytecode of Crowdfunding Events Contract
const crowdFundingEventsContract = require('../Solidity/compiled_contracts/CrowdFundingEvents.json');
const contract = {
    interface: crowdFundingEventsContract.contracts['CrowdFundingEvents.sol']['CrowdFundingEvents'].abi,
    bytecode: crowdFundingEventsContract.contracts['CrowdFundingEvents.sol']['CrowdFundingEvents'].evm.bytecode.object
};

var ganache_acnts; // variable to load ethereum accounts from local network for unit testing
var contract_instance;  // load contract address from local ethereum network

// deploying contract to ganache local ethereum network
beforeEach(async () => {
    // load all ganache accounts
    ganache_acnts = await web3.eth.getAccounts();

    // deploy ethereum contract to ganache local ethereum network
    contract_instance = await new web3.eth.Contract(contract.interface)
        .deploy({data: contract.bytecode})
        .send( {from: ganache_acnts[0], gas: '2000000'});
});


describe('CrowdFundingEvents unit testing',  () => {
    it('CrowdFundingEvents contract deployment success test', async () => {
        var eventAdmin = await contract_instance.methods.crowdfunding_admin().call()
        // checkcing if contract creator is set as admin in the contract
        assert.equal(eventAdmin, ganache_acnts[0]);
    });
    it('Load Crowdfunding event address and manager address to Add Funding Event method', async () => {
        await contract_instance.methods
            .AddFundingEvent(ganache_acnts[4])
            .send({from: ganache_acnts[1]});
        await contract_instance.methods
            .AddFundingEvent(ganache_acnts[5])
            .send({from: ganache_acnts[2]});
        var fundingEvents = await contract_instance.methods.GetFundingEvents().call();
        // checking if first event is stored in contract properly
        assert.equal(ganache_acnts[1], fundingEvents[0].fund_manager);
        assert.equal(ganache_acnts[4], fundingEvents[0].fund_address);
        // checking if second event is stored in contract properly
        assert.equal(ganache_acnts[2], fundingEvents[1].fund_manager);
        assert.equal(ganache_acnts[5], fundingEvents[1].fund_address);
    });
    it('Checking if 2 event addresses are loaded to the contract', async () => {
        await contract_instance.methods
            .AddFundingEvent(ganache_acnts[4])
            .send({from: ganache_acnts[1]});
        await contract_instance.methods
            .AddFundingEvent(ganache_acnts[5])
            .send({from: ganache_acnts[2]});
        var fundingEvents = await contract_instance.methods.GetFundingEvents().call();
        // checking if 2 events are loaded to the contract
        assert.equal(fundingEvents.length, 2);
    });
});


