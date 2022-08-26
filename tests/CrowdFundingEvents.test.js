// Refer references from "Node JS & Solidity References.pdf" in root folder of this application

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
        .deploy({ data: crowdfundingEventsContract.bytecode })
        .send({ from: ganache_acnts[0], gas: '5000000' });

    // create a crowdfunding event using the above main contract and store the address of the created contract in the main contract
    await crowdfundingEventsContract_instance.methods
        .CreateCrowdfundingEvent('fundraising event1', 'fundraising event1 content', Web3.utils.toWei('1', 'ether'))
        .send({ from: ganache_acnts[0], gas: '30000000' });

    //get the addresses of the created contracts from the main contract
    var crowdfundingEvents = await crowdfundingEventsContract_instance.methods.GetCrowdfundingEvents().call();

    // load the crowdfunding instance created by the main contract
    crowdfundingEventContract_instance = await new web3.eth
        .Contract(crowdfundingEventContract.interface,
            crowdfundingEvents[0].crowdfunding_event_address,
            { handleRevert: true });


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
afterEach(function () {
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
    console.log("\n Passed UnitTest Cases");
    console.log("\x1b[32m%s\x1b[0m", unit_test_cases_passed);
    console.log(" \n Failed UnitTest Cases");
    console.log("\x1b[31m%s\x1b[0m", unit_test_cases_failed);
});

describe('Deploy Main Crowdfunding Events Contract', async () => {

    it('1) Checking if contract deployment is successfull', async () => {
        //check if a address is generated when the contract is deployed to the block chain
        assert.notStrictEqual(crowdfundingEventsContract_instance.options.address, undefined);
    });

    it('2) Checking if fundraising disbursal request 1 is deployed successfully using Crowdfunding Events Contract', async () => {
        //check if a address is generated when the contract is deployed to the block chain
        assert.notStrictEqual(crowdfundingEventContract_instance.options.address, undefined);
    });

    it('3) Checking if fundraising disbursal request 1 is deployed by the zeroth ganache[0] eth account with correct details', async () => {
        //calling the GetCrowdfundingEvents method from the Main contract to get the created Crowdfunding Event
        var crowdfundingEvents = await crowdfundingEventsContract_instance.methods.GetCrowdfundingEvents().call();

        //comparing Crowfunding Event Title
        assert.strictEqual('fundraising event1', crowdfundingEvents[0].crowdfunding_event_title);
        //comparing Crowfunding Event description
        assert.strictEqual('fundraising event1 content', crowdfundingEvents[0].crowdfunding_event_content);
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

    it('5) Contribution failure message if contribution is less than the minimum contribution value set (1 ether) in the fundraiser', async () => {
        try {
            //contributor 4 making a contribution of 0.9 eth to the 1st crowdfunding event
            await crowdfundingEventContract_instance.methods
                .DepositToCrowdfundingEvent()
                .send({ from: ganache_acnts[4], value: Web3.utils.toWei('0.9', 'ether'), gas: '3000000' });
            throw 'test case should fail';
        } catch (error) {
            assert.strictEqual(error.reason, 'Deposit value less than the minimum contribution value set in the fundraiser');
        }
    });

    it('6) Contribution failure message if contribution is not in multiples of the minimum contribution value set (1 ether) in the fundraiser', async () => {
        try {
            //contributor 4 making a contribution of 1.5 eth to the 1st crowdfunding event
            await crowdfundingEventContract_instance.methods
                .DepositToCrowdfundingEvent()
                .send({ from: ganache_acnts[4], value: Web3.utils.toWei('1.5', 'ether'), gas: '3000000' });
            throw 'test case should fail';
        } catch (error) {
            assert.strictEqual(error.reason, 'Deposit value not in multiples of the minimum contribution value set in the fundraiser');
        }
    });

    it('7) Contribution failure message if contributor is trying to recontribute', async () => {
        try {
            //contributor 1 making a contribution of 1 eth to the 1st crowdfunding event again
            await crowdfundingEventContract_instance.methods
                .DepositToCrowdfundingEvent()
                .send({ from: ganache_acnts[1], value: Web3.utils.toWei('1', 'ether'), gas: '3000000' });
            throw 'test case should fail';
        } catch (error) {
            assert.strictEqual(error.reason, 'You have already contributed to the fundraiser');
        }
    });

    it('8) Contribution failure message if any disbursal/refund request is created', async () => {
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
            assert.strictEqual(error.reason, 'No new contributions are accepted upon the start of disbursal/refund requests');
        }
    });

});

describe('Create a Voting Event for the fundraising event', async () => {

    beforeEach(async () => {
        //Fund Manager creates 1st voting event with money being sent to ganache account 5 if voting successful
        await crowdfundingEventContract_instance.methods
            .CreateAnVotingEvent('Voting Event1', 'Voting Event1 Description', ganache_acnts[5], '1000000000000000000', 0)
            .send({ from: ganache_acnts[0], gas: '3000000' });
        //Fund Manager creates 2nd voting event with money being sent to ganache account 5 if voting successful
        await crowdfundingEventContract_instance.methods
            .CreateAnVotingEvent('Voting Event2', 'Voting Event2 Description', ganache_acnts[5], '1000000000000000000', 0)
            .send({ from: ganache_acnts[0], gas: '3000000' });
    });

    it('9) Refund request creation failure message if not intiated by fund manager', async () => {
        try {
            //contributor 1 try to intiate an voting event
            await crowdfundingEventContract_instance.methods
                .CreateAnVotingEvent('Voting Event3', 'Voting Event3 Description', ganache_acnts[5], '10000000000000000000', 0)
                .send({ from: ganache_acnts[1], gas: '3000000' });
            throw 'test case should fail';
        } catch (error) {
            assert.strictEqual(error.reason, 'Only managers can create disbursal/refund requests, contributors are only allowed to create refund requests');
        }
    });

    it('10) Refund request creation failure message if intiated by fund manager but amount set to transfer is more than funds collected', async () => {
        try {
            //contributor 0 (fund manager) tries to intiate an voting event with transfer set to 10 eth but collected amount is 9 eth
            await crowdfundingEventContract_instance.methods
                .CreateAnVotingEvent('Voting Event3', 'Voting Event3 Description', ganache_acnts[5], '10000000000000000000', 0)
                .send({ from: ganache_acnts[0], gas: '3000000' });
            throw 'test case should fail';
        } catch (error) {
            assert.strictEqual(error.reason, 'This fundraiser has less Ether than the amount you want to send');
        }
    });

    it('11) Refund request creation failure message if refund request intiated by non-contributor', async () => {
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
            assert.strictEqual(error.reason, 'No new requests can be created when a refund request is active');
        }
    });

    it('12) Voting failure message if voting tried by a non-contributor', async () => {
        try {
            //contributor 0 (fund manager) tries to intiate an voting event with transfer set to 10 eth but collected amount is 9 eth
            await crowdfundingEventContract_instance.methods
                .VoteForVotingEvent(0, 1)
                .send({ from: ganache_acnts[4], gas: '3000000' });
            throw 'test case should fail';
        } catch (error) {
            assert.strictEqual(error.reason, 'You cannot vote as you did not contribute to the fundraiser');
        }
    });

    it('13) Checking if contributor 3 is able to cast his vote as yes and gets his 5 votes stored as yes', async () => {
        //contributor 3 casts his yes vote for Voting Event1
        await crowdfundingEventContract_instance.methods
            .VoteForVotingEvent(0, 1)
            .send({ from: ganache_acnts[3], gas: '3000000' });

        const VotingEvents = await crowdfundingEventContract_instance.methods.GetVotingEvents().call();
        //checking if 5 votes are casted for contributor 3
        assert.strictEqual('5', VotingEvents[0].yes_votes);
        //checking if 5 votes casted by contributor 3 are marked as yes votes
        assert.strictEqual(true, VotingEvents[0].polling_data[0].contributor_vote_status);

    });

    it('14) Checking if contributor 3 is able to cast his vote as no and gets his 5 votes stored as no', async () => {
        //contributor 3 casts his no vote for Voting Event1
        await crowdfundingEventContract_instance.methods
            .VoteForVotingEvent(0, 0)
            .send({ from: ganache_acnts[3], gas: '3000000' });

        const VotingEvents = await crowdfundingEventContract_instance.methods.GetVotingEvents().call();
        //checking if 5 votes are casted for contributor 3
        assert.strictEqual('5', VotingEvents[0].no_votes);
        //checking if 5 votes casted by contributor 3 are marked as no votes
        assert.strictEqual(false, VotingEvents[0].polling_data[0].contributor_vote_status);

    });

    it('15) Voting failure message if a contributor tries voting two times for the same disbursal/refund request', async () => {
        //contributor 3 casts his 5 no votes for Voting Event1
        await crowdfundingEventContract_instance.methods
            .VoteForVotingEvent(0, 0)
            .send({ from: ganache_acnts[3], gas: '3000000' });

        try {
            //contributor 3 casts his 5 no votes for Voting Event1 again
            await crowdfundingEventContract_instance.methods
                .VoteForVotingEvent(0, 0)
                .send({ from: ganache_acnts[3], gas: '3000000' });
            throw 'test case should fail';
        } catch (error) {
            assert.strictEqual(error.reason, 'You have already voted for the disbursal/refund request');
        }
    });

    it('16) Checking if polling for a successful disbursal request is closed and ethereum is successfully sent to the wallet provided by the fund manager', async () => {
        //contributor 3 casts his 5 no votes for Voting Event1
        await crowdfundingEventContract_instance.methods
            .VoteForVotingEvent(0, 1)
            .send({ from: ganache_acnts[3], gas: '3000000' });
        
        //getting account balance of ganache account 5 before polling is closed for voting event 1
        var pre_account_balance = await web3.eth.getBalance(ganache_acnts[5]);

        // Closing polling for voting event 1 with success 
        await crowdfundingEventContract_instance.methods
            .CompleteVotingEvent(0)
            .send({ from: ganache_acnts[3], gas: '3000000' });
        
        //getting account balance of ganache account 5 after polling is closed for voting event 1
        var post_account_balance = await web3.eth.getBalance(ganache_acnts[5]);

        //checking if balance of ganache wallet 5 increased
        assert.strictEqual(post_account_balance > pre_account_balance, true);
        
    });

    it('17) Checking if polling for a failed disbursal request is closed and ethereum is not sent to the wallet provided by the fund manager', async () => {
        //contributor 3 casts his 5 no votes for Voting Event1
        await crowdfundingEventContract_instance.methods
            .VoteForVotingEvent(0, 0)
            .send({ from: ganache_acnts[3], gas: '3000000' });
        
        //getting account balance of ganache account 5 before polling is closed for voting event 1
        var pre_account_balance = await web3.eth.getBalance(ganache_acnts[5]);

        // Closing polling for voting event 1 with success 
        await crowdfundingEventContract_instance.methods
            .CompleteVotingEvent(0)
            .send({ from: ganache_acnts[3], gas: '3000000' });
        
        //getting account balance of ganache account 5 after polling is closed for voting event 1
        var post_account_balance = await web3.eth.getBalance(ganache_acnts[5]);

        //checking if balance of ganache wallet 5 is constant
        assert.strictEqual(post_account_balance == pre_account_balance, true);
        
    });

});

describe('Closing voting events and trying to vote again', async () => {

    beforeEach(async () => {
        //Fund Manager creates 1st voting event with money being sent to ganache account 5 if voting successful
        await crowdfundingEventContract_instance.methods
            .CreateAnVotingEvent('Voting Event1', 'Voting Event1 Description', ganache_acnts[5], '1000000000000000000', 0)
            .send({ from: ganache_acnts[0], gas: '3000000' });
        //Fund Manager creates 2nd voting event with money being sent to ganache account 5 if voting successful
        await crowdfundingEventContract_instance.methods
            .CreateAnVotingEvent('Voting Event2', 'Voting Event2 Description', ganache_acnts[5], '1000000000000000000', 0)
            .send({ from: ganache_acnts[0], gas: '3000000' });
        
        //contributor 3 casts his 5 yes votes for Voting Event1
        await crowdfundingEventContract_instance.methods
            .VoteForVotingEvent(0, 1)
            .send({ from: ganache_acnts[3], gas: '3000000' });

        // Closing polling for voting event 1 with success 
        await crowdfundingEventContract_instance.methods
            .CompleteVotingEvent(0)
            .send({ from: ganache_acnts[3], gas: '3000000' });

        //contributor 1 casts his 1 no vote for Voting Event2
        await crowdfundingEventContract_instance.methods
            .VoteForVotingEvent(1, 0)
            .send({ from: ganache_acnts[1], gas: '3000000' });
    });

    

    it('18) Finish disbursal/refund request failure message if contributor is trying to vote in a finished disbursal/refund request', async () => {
        try {
            //contributor 3 tries to retrigger close polling event of completed voting event1
            await crowdfundingEventContract_instance.methods
                .VoteForVotingEvent(0, 0)
                .send({ from: ganache_acnts[3], gas: '3000000' });
            throw 'test case should fail';
        } catch (error) {
            assert.strictEqual(error.reason, 'Disbursal/refund request already completed');
        }
    });

    it('19) Finish disbursal/refund request failure message if contributor/manager is trying to retrigger a finished disbursal/refund request', async () => {
        try {
            //contributor 3 tries to retrigger close polling event of completed voting event1
            await crowdfundingEventContract_instance.methods
                .CompleteVotingEvent(0)
                .send({ from: ganache_acnts[3], gas: '3000000' });
            throw 'test case should fail';
        } catch (error) {
            assert.strictEqual(error.reason, 'Disbursal/Refund request already completed');
        } 
    });

    it('20) Finish disbursal/refund request failure message if contributor/manager is trying to close disbursal/refund requests with yes/no votes casted being less than 50% ', async () => {
        try {
            //contributor 2 tries to trigger close polling event of incomplete voting event2
            await crowdfundingEventContract_instance.methods
                .CompleteVotingEvent(1)
                .send({ from: ganache_acnts[2], gas: '3000000' });
            throw 'test case should fail';
        } catch (error) {
            assert.strictEqual(error.reason, 'more than 50% votes should say yes/no to send/reject ethereum transfer');
        }
    });

    it('21) Comment failure message if non-contributor is trying to post comments in discussion forums', async () => {
        try {
            //ganache account 4 (non contributor) tries to comment on doscussion forum
            await crowdfundingEventContract_instance.methods
                .CrowdfundingDiscussionForum(99,'I am not able to comment',50)
                .send({ from: ganache_acnts[4], gas: '3000000' });
            throw 'test case should fail';
        } catch (error) {
            assert.strictEqual(error.reason, 'You cannot comment as you are not a contributor of the fundraiser');
        }
    });

    it('22) Checking if contributor is able to post comments in discussion forums', async () => {

        //ganache account 1 (contributor) tries to comment on doscussion forum
        await crowdfundingEventContract_instance.methods
            .CrowdfundingDiscussionForum(99, 'I am able to comment', 50)
            .send({ from: ganache_acnts[1], gas: '3000000' });

        var discussionForumList = await crowdfundingEventContract_instance.methods.GetCrowdfundingDiscussionForum().call();

        //checking if comment stored is matching from the posted comment
        assert.strictEqual(discussionForumList[0].comment, 'I am able to comment');
        //checking if comment stored is done by contirbutor 1
        assert.strictEqual(discussionForumList[0].comment_address, ganache_acnts[1]);
    });

});

describe('Refund voting events', async () => {

    beforeEach(async () => {
        //Fund Manager creates 1st voting event with money being sent to ganache account 5 if voting successful
        await crowdfundingEventContract_instance.methods
            .CreateAnVotingEvent('Voting Event1', 'Voting Event1 Description', ganache_acnts[5], '1000000000000000000', 0)
            .send({ from: ganache_acnts[0], gas: '3000000' });
        //Fund Manager creates 2nd voting event with money being sent to ganache account 5 if voting successful
        await crowdfundingEventContract_instance.methods
            .CreateAnVotingEvent('Voting Event2', 'Voting Event2 Description', ganache_acnts[5], '1000000000000000000', 0)
            .send({ from: ganache_acnts[0], gas: '3000000' });
        
        //contributor 3 casts his 5 yes votes for Voting Event1
        await crowdfundingEventContract_instance.methods
            .VoteForVotingEvent(0, 1)
            .send({ from: ganache_acnts[3], gas: '3000000' });

        // Closing polling for voting event 1 with success 
        await crowdfundingEventContract_instance.methods
            .CompleteVotingEvent(0)
            .send({ from: ganache_acnts[3], gas: '3000000' });

        //contributor 1 casts his 1 no vote for Voting Event2
        await crowdfundingEventContract_instance.methods
            .VoteForVotingEvent(1, 0)
            .send({ from: ganache_acnts[1], gas: '3000000' });
        
        //contributor 1 creates a refund voting event1
        await crowdfundingEventContract_instance.methods
            .CreateAnVotingEvent('Refund voting event1', 'Refund voting event1 Description', ganache_acnts[1], '10000000000', 1)
            .send({ from: ganache_acnts[1], gas: '3000000' });
    });

    

    it('23) Checking if a contributor is able to create refund request 1', async () => {
        const VotingEvents = await crowdfundingEventContract_instance.methods.GetVotingEvents().call();
            assert.strictEqual(VotingEvents[2].refund_event, true);
    });

    it('24) Refund request failure message if the same contributor is trying to create refund request 2 after the failure of refund request 1', async () => {
        //contributor 3 casts his 5 no votes for refund voting event1
        await crowdfundingEventContract_instance.methods
            .VoteForVotingEvent(2, 0)
            .send({ from: ganache_acnts[3], gas: '3000000' });
        
        //contributor 3 completes the polling for refund voting event1
        await crowdfundingEventContract_instance.methods
            .CompleteVotingEvent(2)
            .send({ from: ganache_acnts[3], gas: '3000000' });

        try {
            //contributor 1 tries to recreate refund voting event 2 after failed refund voting event 1
            await crowdfundingEventContract_instance.methods
            .CreateAnVotingEvent('Refund voting event2', 'Refund voting event2 Description', ganache_acnts[1], '10000000000', 1)
            .send({ from: ganache_acnts[1], gas: '3000000' });
            throw 'test case should fail';
        } catch (error) {
            assert.strictEqual(error.reason, 'Contributor has already created a failed refund request previously');
        }
    });

    it('25) Checking if successful refund request is disabling all other pending requests in the fundraiser', async () => {
        //contributor 3 casts his 5 no votes for refund voting event1
        await crowdfundingEventContract_instance.methods
            .VoteForVotingEvent(2, 1)
            .send({ from: ganache_acnts[3], gas: '3000000' });
        
        //contributor 3 completes the polling for refund voting event1
        await crowdfundingEventContract_instance.methods
            .CompleteVotingEvent(2)
            .send({ from: ganache_acnts[3], gas: '3000000' });

        try {
            //fund manager tries to create a new voting event 3 after a successfull refund event success with money being sent to ganache account 5
            await crowdfundingEventContract_instance.methods
                .CreateAnVotingEvent('Voting Event3', 'Voting Event3 Description', ganache_acnts[5], '1000000000000000000', 0)
                .send({ from: ganache_acnts[0], gas: '3000000' });
            
        } catch (error) {
            assert.strictEqual(error.reason, 'This fundraiser has failed and is marked for refund, contributors can start claiming their left over ethereum from this fundraiser');
        }
    });

    it('26) Claim refund failure message if a contributor is trying to claim refund from a fundraiser whose refund event success flag is not set to true', async () => {
        try {
            // contributor 1 claiming refund
            await crowdfundingEventContract_instance.methods
                .ClaimRefund()
                .send({ from: ganache_acnts[1], gas: '3000000' });
            throw 'test case should fail';
        } catch (error) {
            assert.strictEqual(error.reason, 'This fundraiser is still ongoing..!!');
        }
    });

});


describe('Refund voting events', async () => {

    beforeEach(async () => {
        //Fund Manager creates 1st voting event with money being sent to ganache account 5 if voting successful
        await crowdfundingEventContract_instance.methods
            .CreateAnVotingEvent('Voting Event1', 'Voting Event1 Description', ganache_acnts[5], '1000000000000000000', 0)
            .send({ from: ganache_acnts[0], gas: '3000000' });
        //Fund Manager creates 2nd voting event with money being sent to ganache account 5 if voting successful
        await crowdfundingEventContract_instance.methods
            .CreateAnVotingEvent('Voting Event2', 'Voting Event2 Description', ganache_acnts[5], '1000000000000000000', 0)
            .send({ from: ganache_acnts[0], gas: '3000000' });
        
        //contributor 3 casts his 5 yes votes for Voting Event1
        await crowdfundingEventContract_instance.methods
            .VoteForVotingEvent(0, 1)
            .send({ from: ganache_acnts[3], gas: '3000000' });

        // Closing polling for voting event 1 with success 
        await crowdfundingEventContract_instance.methods
            .CompleteVotingEvent(0)
            .send({ from: ganache_acnts[3], gas: '3000000' });

        //contributor 1 casts his 1 no vote for Voting Event2
        await crowdfundingEventContract_instance.methods
            .VoteForVotingEvent(1, 0)
            .send({ from: ganache_acnts[1], gas: '3000000' });
        
        //contributor 1 creates a refund voting event1
        await crowdfundingEventContract_instance.methods
            .CreateAnVotingEvent('Refund voting event1', 'Refund voting event1 Description', ganache_acnts[1], '10000000000', 1)
            .send({ from: ganache_acnts[1], gas: '3000000' });

        //contributor 3 casts his 5 no votes for refund voting event1
        await crowdfundingEventContract_instance.methods
            .VoteForVotingEvent(2, 1)
            .send({ from: ganache_acnts[3], gas: '3000000' });

        //contributor 3 completes the polling for refund voting event1
        await crowdfundingEventContract_instance.methods
            .CompleteVotingEvent(2)
            .send({ from: ganache_acnts[3], gas: '3000000' });
    });


    it('27) Checking if contributors 1,2,3 are able to claim their refunds for a fundraiser with refund event success flag set to true', async () => {

        //pre and post account balance arrays for contributors
        var pre_account_balance_of_contributors = [];
        var post_account_balance_of_contributors = [];

        //getting account balance of contributor 1,2,3 before claiming refund
        pre_account_balance_of_contributors.push(await web3.eth.getBalance(ganache_acnts[1]));
        pre_account_balance_of_contributors.push(await web3.eth.getBalance(ganache_acnts[2]));
        pre_account_balance_of_contributors.push(await web3.eth.getBalance(ganache_acnts[3]));

        // contributor 1 claiming refund
        await crowdfundingEventContract_instance.methods
            .ClaimRefund()
            .send({ from: ganache_acnts[1], gas: '3000000' });

        // contributor 2 claiming refund
        await crowdfundingEventContract_instance.methods
            .ClaimRefund()
            .send({ from: ganache_acnts[2], gas: '3000000' });
        
        // contributor 3 claiming refund
        await crowdfundingEventContract_instance.methods
            .ClaimRefund()
            .send({ from: ganache_acnts[3], gas: '3000000' });
        
        //getting account balance of contributor 1,2,3 after claiming refund
        post_account_balance_of_contributors.push(await web3.eth.getBalance(ganache_acnts[1]));
        post_account_balance_of_contributors.push(await web3.eth.getBalance(ganache_acnts[2]));
        post_account_balance_of_contributors.push(await web3.eth.getBalance(ganache_acnts[3]));

        // checking if account balance of contributor 1 increased
        assert.strictEqual(post_account_balance_of_contributors[0] > pre_account_balance_of_contributors[0], true);
        // checking if account balance of contributor 2 increased
        assert.strictEqual(post_account_balance_of_contributors[1] > pre_account_balance_of_contributors[1], true);
        // checking if account balance of contributor 3 increased
        assert.strictEqual(post_account_balance_of_contributors[2] > pre_account_balance_of_contributors[2], true);

    });

    it('28) Claim refund failure message if a contributor is trying to claim refund more than once', async () => {

        // contributor 1 claiming refund
        await crowdfundingEventContract_instance.methods
            .ClaimRefund()
            .send({ from: ganache_acnts[1], gas: '3000000' });

        try {
            // contributor 1 claiming refund again
            await crowdfundingEventContract_instance.methods
                .ClaimRefund()
                .send({ from: ganache_acnts[1], gas: '3000000' });
            throw 'test case should fail';
        } catch (error) {
            assert.strictEqual(error.reason, 'You have already claimed your refund..!!');
        }

    });

    it('29) Claim refund failure message if a non-contributor is trying to claim refund more than once', async () => {

        try {
            // contributor 1 claiming refund again
            await crowdfundingEventContract_instance.methods
                .ClaimRefund()
                .send({ from: ganache_acnts[4], gas: '3000000' });
            throw 'test case should fail';
        } catch (error) {
            assert.strictEqual(error.reason, 'You cannot claim a refund if you are not a contributor');
        }

    });

});


