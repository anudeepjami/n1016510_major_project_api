// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

contract CrowdfundingEvents{
    address public crowdfunding_admin;
    crowd_funding_event[] public crowdFundingEventAddresses;

    struct crowd_funding_event {
        string crowdfunding_event_title;
        string crowdfunding_event_content;
        address crowdfunding_event_address;
        address crowdfunding_event_manager_address;
        uint crowdfunding_event_min_deposit;
    }

    constructor(){
        crowdfunding_admin = msg.sender;
    }

    function CreateCrowdfundingEvent(string memory _crowdfunding_event_title, string memory _crowdfunding_event_content, uint _crowdfunding_event_min_deposit) public{
        address _crowdfunding_event_address = address(new CrowdfundingEvent(_crowdfunding_event_title, _crowdfunding_event_content, msg.sender, _crowdfunding_event_min_deposit));
        crowdFundingEventAddresses.push(
            crowd_funding_event(
                _crowdfunding_event_title,
                _crowdfunding_event_content,
                _crowdfunding_event_address,
                msg.sender,
                _crowdfunding_event_min_deposit
            ));
    }

    function GetCrowdfundingEvents() public view returns (crowd_funding_event[] memory){
        return crowdFundingEventAddresses;
    }

}

contract CrowdfundingEvent{
    string public crowdfunding_event_title;
    string public crowdfunding_event_content;
    address public crowdfunding_event_manager_address;
    uint public crowdfunding_event_min_deposit;
    contributor_details[] public contributors_details;
    mapping(address => uint) public contributor_votes;
    mapping(address => bool) public contributor_already_created_refund_event;
    uint public total_votes = 0;
    voting_event[] public voting_events;
    voting_address_status[] voting_event_address_status;
    discussion_forum[] public discussions;
    bool public refund_event_active;
    

    struct contributor_details{
        address contributor_address;
        uint contributor_votes;
    }

    struct voting_event{
        string title;
        string body;
        address payable destination_wallet_address;
        uint amount_to_send;
        bool event_success_status;
        bool event_completion_status;
        uint yes_votes;
        uint no_votes;
        voting_address_status_array[] polling_data;
        bool refund_event;
    }

    struct voting_address_status_array
    {
        address contributor_address;
        bool contributor_vote_status;
    }

    struct voting_address_status{
        mapping(address => bool) address_voting_status;
    }

    struct discussion_forum{
        uint index;
        address comment_address;
        string comment;
        uint rating;
    }

    constructor(string memory _crowdfunding_event_title, string memory _crowdfunding_event_content, address _crowdfunding_event_manager_address, uint _crowdfunding_event_min_deposit) {
        crowdfunding_event_title = _crowdfunding_event_title;
        crowdfunding_event_content = _crowdfunding_event_content;
        crowdfunding_event_manager_address = _crowdfunding_event_manager_address;
        crowdfunding_event_min_deposit = _crowdfunding_event_min_deposit;
    }
    

    function GetVotingEvents() public view returns (voting_event[] memory){
        return voting_events;
    }

    function GetCrowdfundingDiscussionForum() public view returns (discussion_forum[] memory){
        return discussions;
    }

    function GetCrowdfundingEventDetails() public view returns (string memory, string memory, address, uint, contributor_details[] memory, uint, uint, uint){
        return (crowdfunding_event_title, crowdfunding_event_content, crowdfunding_event_manager_address, crowdfunding_event_min_deposit, contributors_details,total_votes,address(this).balance,voting_events.length);
    }

    function DepositToCrowdfundingEvent() public payable {
        require(voting_events.length == 0, 'No contributions are accepted upon start of voting events');
        require(msg.value >= crowdfunding_event_min_deposit, 'deposit value less than minimum offer value');
        require(msg.value % crowdfunding_event_min_deposit == 0, 'deposit value not in multiples of minimum offer value');
        require(contributor_votes[msg.sender] == 0,'You have already contributed to the event');
        contributor_votes[msg.sender] = msg.value / crowdfunding_event_min_deposit;
        contributors_details.push(
            contributor_details(
                msg.sender,
                contributor_votes[msg.sender]
            )
        );
        total_votes = total_votes + contributor_votes[msg.sender];
    }

    function CreateAnVotingEvent(string memory title, string memory body, address payable destination_wallet_address, uint amount_to_send, bool refund_event) public {
        require(crowdfunding_event_manager_address == msg.sender || (refund_event == true && contributor_votes[msg.sender] > 0), 'only managers can create fund requests, contributors are only allowed to create refund requests');
        require(refund_event_active == false, 'No new events can be created when an refund event is active');
        require(contributor_already_created_refund_event[msg.sender] == false, 'contributor already create a failed refund event before');
        require(address(this).balance >= amount_to_send, 'This Crowdfunding Event has less money than the amount you want to send');
        require(address(this).balance > 0, 'This Crowdfunding Event has no money to create new voting events');
        voting_event storage temp = voting_events.push();
        temp.title = title;
        temp.body = body;
        temp.destination_wallet_address = destination_wallet_address;
        temp.amount_to_send = amount_to_send;
 
        if(refund_event == true){
            temp.refund_event = true;
            refund_event_active = true;
            contributor_already_created_refund_event[msg.sender] = true;
        }

        voting_address_status storage temp2= voting_event_address_status.push();
    }

    function VoteForVotingEvent(uint voting_event_index, bool vote) public{
        require(voting_events[voting_event_index].event_completion_status == false, 'Voting Event Already Completed' );
        require(contributor_votes[msg.sender] > 0,'You cannot vote as you did not contribute to the crowdfunding event');
        require(voting_event_address_status[voting_event_index].address_voting_status[msg.sender] == false , 'You have already voted for the funding event');

        vote ? voting_events[voting_event_index].yes_votes = voting_events[voting_event_index].yes_votes + contributor_votes[msg.sender]
                : voting_events[voting_event_index].no_votes = voting_events[voting_event_index].no_votes + contributor_votes[msg.sender];
        voting_event_address_status[voting_event_index].address_voting_status[msg.sender] = true;
        voting_events[voting_event_index].polling_data.push(
                voting_address_status_array(
                    msg.sender,
                    vote
                )
            );
    }

    function CompleteVotingEvent(uint voting_event_index) public{
        require(address(this).balance >= voting_events[voting_event_index].amount_to_send || refund_event_active == true, 'This Crowdfunding Event has less money than the amount set at the creation of this voting request' );
        require(voting_events[voting_event_index].event_completion_status == false, 'Voting Event Already Completed' );
        require(voting_events[voting_event_index].yes_votes > (total_votes / 2) 
                    || voting_events[voting_event_index].no_votes > (total_votes / 2)
                        , 'more than 50% votes should say yes/no to send/reject ethereum transfer');

        if(voting_events[voting_event_index].yes_votes > (total_votes / 2))
        {
            if(voting_events[voting_event_index].refund_event)
            {
                uint fund_balance = (address(this).balance);
                for(uint i = 0; i < contributors_details.length; i++){
                    payable(contributors_details[i].contributor_address).transfer((fund_balance * contributor_votes[contributors_details[i].contributor_address])/total_votes);
                }
            }
            else
            {
                voting_events[voting_event_index].destination_wallet_address.transfer(voting_events[voting_event_index].amount_to_send);
            }
            voting_events[voting_event_index].event_success_status = true;
        }
        else
        {
            voting_events[voting_event_index].event_success_status = false;
        }
        voting_events[voting_event_index].event_completion_status = true;
        if(voting_events[voting_event_index].refund_event)
            {
                refund_event_active = false;
            }
    }

    function CrowdfundingDiscussionForum(uint index,string memory comment, uint rating) public{
        require(contributor_votes[msg.sender] > 0,'You cannot comment as you did not contribute to the crowdfunding event');
        discussions.push(
            discussion_forum(
                index,
                msg.sender,
                comment,
                rating
            )
        );
    }
}
