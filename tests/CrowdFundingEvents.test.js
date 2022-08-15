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
var crowdfundingEventsContract_instance;  // load contract address from local ethereum network
var crowdfundingEventContract_instance;

// deploying contract to ganache local ethereum network
beforeEach(async () => {
    // load all ganache accounts
    ganache_acnts = await web3.eth.getAccounts();

    // deploy ethereum contract to ganache local ethereum network
    crowdfundingEventsContract_instance = await new web3.eth
        .Contract(crowdfundingEventsContract.interface)
        .deploy({ data: crowdfundingEventsContract.bytecode, arguments: ['AJ Hybrid DAO Crowdfunding'] })
        .send({ from: ganache_acnts[0], gas: '4000000' });

    await crowdfundingEventsContract_instance.methods
        .CreateCrowdfundingEvent('Event1', 'Event1 content', 10000000)
        .send({ from: ganache_acnts[0], gas: '3000000' });

    var crowdfundingEvents = await crowdfundingEventsContract_instance.methods.GetCrowdfundingEvents().call();

    crowdfundingEventContract_instance = await new web3.eth
        .Contract(crowdfundingEventContract.interface, crowdfundingEvents[0].crowdfunding_event_address, {handleRevert: true});
});


describe('CrowdFundingEvents unit testing', () => {
    it('CrowdFundingEvents contract deployment success by comparing contract creator address', async () => {
        var eventAdmin = await crowdfundingEventsContract_instance.methods.crowdfunding_admin().call()
        // checkcing if contract creator is set as admin in the contract
        assert.strictEqual(eventAdmin, ganache_acnts[0]);
    });
    it('CrowdFundingEvent contract deployment success check by comparing addresses', async () => {
        var crowdfundingEvents = await crowdfundingEventsContract_instance.methods.GetCrowdfundingEvents().call();
        assert.strictEqual(crowdfundingEvents[0].crowdfunding_event_address, crowdfundingEventContract_instance.options.address);
    });
    it('CrowdFundingEvent contract check if manager is correct', async () => {
        var crowdfunding_event_manager_address = await crowdfundingEventContract_instance.methods.crowdfunding_event_manager_address().call();
        assert.strictEqual(crowdfunding_event_manager_address, ganache_acnts[0]);
    });
    it('CrowdFundingEvent contract create success with 2 unique users', async () => {
        await crowdfundingEventsContract_instance.methods
            .CreateCrowdfundingEvent('Event1', 'Event1 content', 10000000)
            .send({ from: ganache_acnts[1], gas: '3000000' });
        await crowdfundingEventsContract_instance.methods
            .CreateCrowdfundingEvent('Event2', 'Event2 content', 10000000)
            .send({ from: ganache_acnts[2], gas: '3000000' });
        var crowdfundingEvents = await crowdfundingEventsContract_instance.methods.GetCrowdfundingEvents().call();
        assert.strictEqual(crowdfundingEvents[1].crowdfunding_event_title, 'Event1');
        assert.strictEqual(crowdfundingEvents[1].crowdfunding_event_manager_address, ganache_acnts[1]);
        assert.strictEqual(crowdfundingEvents[2].crowdfunding_event_title, 'Event2');
        assert.strictEqual(crowdfundingEvents[2].crowdfunding_event_manager_address, ganache_acnts[2]);
    });
    it('CrowdFundingEvent contract check if another user is able to deposit and if user is set as a contributor ', async () => {
        await crowdfundingEventContract_instance.methods
            .DepositToCrowdfundingEvent()
            .send({ from: ganache_acnts[1], value: 10000000, gas: '3000000' });
        var contributor_votes = await crowdfundingEventContract_instance.methods.contributor_votes(ganache_acnts[1]).call()
        assert.strictEqual(contributor_votes > 0, true);
    });
    it('CrowdFundingEvent contract check if another user is not able to deposit due to less contribution ', async () => {
        try {
            const reason = await crowdfundingEventContract_instance.methods
                .DepositToCrowdfundingEvent()
                .send({ from: ganache_acnts[1], value: 1000000, gas: '3000000' });
            throw 'test case should fail';
        } catch (error) {
            assert.strictEqual(error.reason, 'deposit value less than minimum offer value');
        }
    });
});


