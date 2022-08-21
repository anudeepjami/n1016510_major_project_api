// create ganache local instance for unit testing
const ganache = require('ganache');

// create web3 instance with above ganache instance
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

//assert for comparing expected output and generated output of mocha tests
const assert = require('assert');

//importing abi and bytecode of Crowdfunding Events Contract and crowdfunding Event contract
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
var crowdfundingEventsContract_instance;  // load the Crowdfunding root contract address from local ethereum network
var crowdfundingEventContract_instance;   // load the Crowdfunding contract address from local ethereum network

// deploying contract to ganache local ethereum network
beforeEach(async () => {
    
    // load all ganache accounts
    ganache_acnts = await web3.eth.getAccounts();
    console.log(ganache_acnts);

    // deploy the main crowdfuning Events contract which can deploy subcontracts for creating crowdfunding events
    crowdfundingEventsContract_instance = await new web3.eth
        .Contract(crowdfundingEventsContract.interface)
        .deploy({ data: crowdfundingEventsContract.bytecode})
        .send({ from: ganache_acnts[0], gas: '5000000' });

    // create a crowdfunding event using the above main contract and store the address of the created contract in the main contract
    await crowdfundingEventsContract_instance.methods
        .CreateCrowdfundingEvent('create fund raising event1', 'fund raising event1 content', Web3.utils.toWei('1', 'ether'))
        .send({ from: ganache_acnts[0], gas: '30000000' });

    //get the addresses of the created contracts from the main contract
    var crowdfundingEvents = await crowdfundingEventsContract_instance.methods.GetCrowdfundingEvents().call();

    // load the crowdfunding instance created by the main contract
    crowdfundingEventContract_instance = await new web3.eth
        .Contract(crowdfundingEventContract.interface, 
                    crowdfundingEvents[0].crowdfunding_event_address, 
                    {handleRevert: true});

    
    //contributor 1 making a contribution of 1 eth to the 1st crowdfunding event
    await crowdfundingEventContract_instance.methods
        .DepositToCrowdfundingEvent()
        .send({ from: ganache_acnts[1], value: Web3.utils.toWei('1', 'ether'), gas: '3000000' });
    //contributor 2 making a contribution of 3 eth to the 1st crowdfunding event
    await crowdfundingEventContract_instance.methods
        .DepositToCrowdfundingEvent()
        .send({ from: ganache_acnts[2], value: Web3.utils.toWei('3', 'ether'), gas: '3000000' });
    //contributor 3 making a contribution of 3 eth to the 1st crowdfunding event
    await crowdfundingEventContract_instance.methods
        .DepositToCrowdfundingEvent()
        .send({ from: ganache_acnts[3], value: Web3.utils.toWei('5', 'ether'), gas: '3000000' });
                

});

var unit_test_cases_failed = [];  // Create a list of failed test cases
var unit_test_cases_passed = [];  // Create a list of passed test cases

//runs after each test case is executed
afterEach( function() {
    //extract the test case title
    const testcase_title_title = this.currentTest.title;
    // extract if test case failed or passed
    const testcase_title_state = this.currentTest.state;
    //collecting passed and failed test cases to their arrays
    if (testcase_title_state == "passed") {
        unit_test_cases_passed.push(testcase_title_title)
    } else if (testcase_title_state == "failed") {
        unit_test_cases_failed.push(testcase_title_title)
    }
});

//runs after all test cases are executed
after(() => {
    //Printing all passed and failed test cases
    console.log("\n All Passed UnitTest Cases");
    console.log("\x1b[32m%s\x1b[0m", unit_test_cases_passed);
    console.log(" \n All Failed UnitTest Cases");
    console.log("\x1b[31m%s\x1b[0m", unit_test_cases_failed);
    
});

describe('Deploy Main Crowdfunding Events Contract', async () => {
    
    it('1) Checking if contract deployment is successfull', async () => {
        //check if a address is generated when the contract is deployed to the block chain
        assert.notStrictEqual(crowdfundingEventsContract_instance.options.address, undefined);
    });

    it('2) Checking if Crowdfunding Event is deployed successfully using Crowdfunding Events Contract', async () => {
        //check if a address is generated when the contract is deployed to the block chain
        assert.notStrictEqual(crowdfundingEventContract_instance.options.address, undefined);
    });

    it('3) Checking if Crowdfunding Event is deployed by the first 1 ganache eth account with correct details', async () => {
        //calling the GetCrowdfundingEvents method from the Main contract to get the created Crowdfunding Event
        var crowdfundingEvents = await crowdfundingEventsContract_instance.methods.GetCrowdfundingEvents().call();

        //comparing Crowfunding Event Title
        assert.strictEqual('create fund raising event1', crowdfundingEvents[0].crowdfunding_event_title);
        //comparing Crowfunding Event description
        assert.strictEqual('fund raising event1 content', crowdfundingEvents[0].crowdfunding_event_content);
        //check if a address while creation is equal to address after storage into contract
        assert.strictEqual(crowdfundingEventContract_instance.options.address, crowdfundingEvents[0].crowdfunding_event_address);
        // checking if the first ganace account created the fundraising event
        assert.strictEqual(ganache_acnts[0], crowdfundingEvents[0].crowdfunding_event_manager_address);
        // comparing the minimum value set for fundraising event
        assert.strictEqual(Web3.utils.toWei('1', 'ether'), crowdfundingEvents[0].crowdfunding_event_min_deposit);
        
    });

    it('4) Checking if the first three ganache accounts contributed 1,3 & 5 ethers and also if they get 1,3,5 votes', async () => {
        //calling the Crowdfunding Event contract created using the Main Contract
        var fundraisingEvent = await crowdfundingEventContract_instance.methods.GetCrowdfundingEventDetails().call();

        var crowdfunding_event_min_deposit = parseInt(fundraisingEvent[3]); // getting the minimum contribution value set in the fundraising contract
        var contributor_votes;// variable to get votes associated to each contributor

        //checking if 1st ganache account contribution is equal to 1 ether by multiplying minimum eth contribution with their votes
        contributor_votes = fundraisingEvent[4][0].contributor_votes;
        assert.strictEqual(1000000000000000000, crowdfunding_event_min_deposit * contributor_votes);
        //checking if 2nd ganache account contribution is equal to 3 ether by multiplying minimum eth contribution with their votes
        contributor_votes = fundraisingEvent[4][1].contributor_votes;
        assert.strictEqual(3000000000000000000, crowdfunding_event_min_deposit * contributor_votes); 
        //checking if 3rd ganache account contribution is equal to 5 ether by multiplying minimum eth contribution with their votes
        contributor_votes = fundraisingEvent[4][2].contributor_votes;
        assert.strictEqual(5000000000000000000, crowdfunding_event_min_deposit * contributor_votes);
    });

    it('5) Contribution fail message if contribution is less than minimum value set (1 ether)', async () => {
        try {
            //contributor 4 making a contribution of 0.9 eth to the 1st crowdfunding event
            await crowdfundingEventContract_instance.methods
                .DepositToCrowdfundingEvent()
                .send({ from: ganache_acnts[4], value: Web3.utils.toWei('0.9', 'ether'), gas: '3000000' });
            throw 'test case should fail';
        } catch (error) {
            assert.strictEqual(error.reason, 'deposit value less than minimum offer value');
        }
    });

    it('6) Contribution fail message if contribution is not in multiples of minimum value set (1 ether)', async () => {
        try {
            //contributor 4 making a contribution of 1.5 eth to the 1st crowdfunding event
            await crowdfundingEventContract_instance.methods
                .DepositToCrowdfundingEvent()
                .send({ from: ganache_acnts[4], value: Web3.utils.toWei('1.5', 'ether'), gas: '3000000' });
            throw 'test case should fail';
        } catch (error) {
            assert.strictEqual(error.reason, 'deposit value not in multiples of minimum offer value');
        }
    });

    it('7) Contribution fail message if contribution is already made by an user', async () => {
        try {
            //contributor 1 making a contribution of 1 eth to the 1st crowdfunding event again
            await crowdfundingEventContract_instance.methods
                .DepositToCrowdfundingEvent()
                .send({ from: ganache_acnts[1], value: Web3.utils.toWei('1', 'ether'), gas: '3000000' });
            throw 'test case should fail';
        } catch (error) {
            assert.strictEqual(error.reason, 'You have already contributed to the event');
        }
    });

    it('8) New contribution fail message if any voting event is created by the manager', async () => {
        //Fund Manager creates an voting event
        await crowdfundingEventContract_instance.methods
            .CreateAnVotingEvent('Voting Event1', 'Voting Event1 Description', ganache_acnts[5], 1000000, 0)
            .send({ from: ganache_acnts[0], gas: '3000000' });
        try {
            //contributor 4 making a contribution of 1 eth to the 1st crowdfunding event again
            await crowdfundingEventContract_instance.methods
                .DepositToCrowdfundingEvent()
                .send({ from: ganache_acnts[4], value: Web3.utils.toWei('1', 'ether'), gas: '3000000' });
            throw 'test case should fail';
        } catch (error) {
            assert.strictEqual(error.reason, 'No contributions are accepted upon start of voting events');
        }
    });

});

describe('Create a Voting Event for the fundraising event', async () => {

    beforeEach(async () => {
        //Fund Manager creates 1st voting event
        await crowdfundingEventContract_instance.methods
            .CreateAnVotingEvent('Voting Event1', 'Voting Event1 Description', ganache_acnts[5], '1000000000000000000', 0)
            .send({ from: ganache_acnts[0], gas: '3000000' });
        //Fund Manager creates 2nd voting event
        await crowdfundingEventContract_instance.methods
            .CreateAnVotingEvent('Voting Event2', 'Voting Event2 Description', ganache_acnts[5], '1000000000000000000', 0)
            .send({ from: ganache_acnts[0], gas: '3000000' });
    });

    it('9) Voting Event Creation fail message if not intiated by manager', async () => {
        try {
            //contributor 1 try to intiate an voting event
            await crowdfundingEventContract_instance.methods
                .CreateAnVotingEvent('Voting Event3', 'Voting Event3 Description', ganache_acnts[5], '10000000000000000000', 0)
                .send({ from: ganache_acnts[1], gas: '3000000' });
            throw 'test case should fail';
        } catch (error) {
            assert.strictEqual(error.reason, 'only managers can create fund requests, contributors are only allowed to create refund requests');
        }
    });

    it('10) Voting Event Creation fail message if intiated by manager but amount set to transfer is more than funds collected', async () => {
        try {
            //contributor 0 (fund manager) tries to intiate an voting event with transfer set to 10 eth but collected amount is 9 eth
            await crowdfundingEventContract_instance.methods
                .CreateAnVotingEvent('Voting Event3', 'Voting Event3 Description',ganache_acnts[5], '10000000000000000000', 0)
                .send({ from: ganache_acnts[0], gas: '3000000' });
            throw 'test case should fail';
        } catch (error) {
            assert.strictEqual(error.reason, 'This Crowdfunding Event has less money than the amount you want to send');
        }
    });

    it('11) New Voting Event Creation fail message if refund event intiated by anyone/manager', async () => {
        //contributor 1 creates an refund event
        await crowdfundingEventContract_instance.methods
            .CreateAnVotingEvent('Refund Event1', 'Refund Event1 ', ganache_acnts[5], '9000000000000000000', 1)
            .send({ from: ganache_acnts[1], gas: '3000000' });
        try {
            //contributor 0 (fund manager) try to intiate an voting event
            await crowdfundingEventContract_instance.methods
                .CreateAnVotingEvent('Voting Event3', 'Voting Event3 Description', ganache_acnts[5], '1000000000000000000', 0)
                .send({ from: ganache_acnts[0], gas: '3000000' });
            throw 'test case should fail';
        } catch (error) {
            assert.strictEqual(error.reason, 'No new events can be created when an refund event is active');
        }
    });

    it('12) Voting fail message if voting tried by a non contributor', async () => {
        try {
            //contributor 0 (fund manager) tries to intiate an voting event with transfer set to 10 eth but collected amount is 9 eth
            await crowdfundingEventContract_instance.methods
                .VoteForVotingEvent(0,1)
                .send({ from: ganache_acnts[4], gas: '3000000' });
            throw 'test case should fail';
        } catch (error) {
            assert.strictEqual(error.reason, 'You cannot vote as you did not contribute to the crowdfunding event');
        }
    });

    it('13) Checking if contributor 3 is able to cast his vote as yes and gets his 5 votes stored as yes', async () => {
        //contributor 3 casts his yes vote for Voting Event1
        await crowdfundingEventContract_instance.methods
            .VoteForVotingEvent(0,1)
            .send({ from: ganache_acnts[3], gas: '3000000' });
        
        const VotingEvents = await crowdfundingEventContract_instance.methods.GetVotingEvents().call();
        //checking if 5 votes are casted for contributor 3
        assert.strictEqual('5',VotingEvents[0].yes_votes);
        //checking if 5 votes casted by contributor 3 are marked as yes votes
        assert.strictEqual(true,VotingEvents[0].polling_data[0].contributor_vote_status);
        
    });

    it('13) Checking if contributor 3 is able to cast his vote as no and gets his 5 votes stored as no', async () => {
        //contributor 3 casts his no vote for Voting Event1
        await crowdfundingEventContract_instance.methods
            .VoteForVotingEvent(0,0)
            .send({ from: ganache_acnts[3], gas: '3000000' });
        
        const VotingEvents = await crowdfundingEventContract_instance.methods.GetVotingEvents().call();
        //checking if 5 votes are casted for contributor 3
        assert.strictEqual('5',VotingEvents[0].no_votes);
        //checking if 5 votes casted by contributor 3 are marked as no votes
        assert.strictEqual(false,VotingEvents[0].polling_data[0].contributor_vote_status);
        
    });

});

