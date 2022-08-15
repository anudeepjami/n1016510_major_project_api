// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

contract CrowdfundingEvents{
    address public crowdfunding_admin;
    string public crowdfunding_admin_name;
    crowd_funding_event[] public crowdFundingEventAddresses;

    struct crowd_funding_event {
        string crowdfunding_event_title;
        string crowdfunding_event_content;
        address crowdfunding_event_address;
        address crowdfunding_event_manager_address;
        uint crowdfunding_event_min_deposit;
    }

    constructor(string memory _crowdfunding_admin_name){
        crowdfunding_admin = msg.sender;
        crowdfunding_admin_name = _crowdfunding_admin_name;
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
    uint public contract_creation_timestamp;
    address[] public contributors_addresses;
    mapping(address => bool) public contributors_check;
    mapping(address => uint) public contributors_weight;
    voting_event[] public voting_events;


    struct voting_event{
        string title;
        string body;
        address payable destination_wallet_address;
        uint amount_to_send;
        bool event_status;
        uint yes_count;
        mapping(address => bool) address_status;
    }

    constructor(string memory _crowdfunding_event_title, string memory _crowdfunding_event_content, address _crowdfunding_event_manager_address, uint _crowdfunding_event_min_deposit) {
        crowdfunding_event_title = _crowdfunding_event_title;
        crowdfunding_event_content = _crowdfunding_event_content;
        crowdfunding_event_manager_address = _crowdfunding_event_manager_address;
        crowdfunding_event_min_deposit = _crowdfunding_event_min_deposit;
        contract_creation_timestamp = block.timestamp;
    }
    
    function GetContributorsAddresses() public view returns (address[] memory){
        return contributors_addresses;
    }

    function DepositToCrowdfundingEvent() public payable {
        require(msg.value >= crowdfunding_event_min_deposit, 'deposit value less than minimum offer value');
        require(msg.value % crowdfunding_event_min_deposit == 0, 'deposit value not in multiples of minimum offer value');
        contributors_addresses.push(msg.sender);
        contributors_check[msg.sender] = true;
        contributors_weight[msg.sender] = msg.value / crowdfunding_event_min_deposit;
    }

    function CreateAnVotingEvent(string memory title, string memory body, address payable destination_wallet_address, uint amount_to_send) public {
        require(crowdfunding_event_manager_address == msg.sender, 'only managers can create fund requests');
        voting_event storage temp = voting_events.push();
        temp.title = title;
        temp.body = body;
        temp.destination_wallet_address = destination_wallet_address;
        temp.amount_to_send = amount_to_send;
        temp.event_status = false;
        temp.yes_count = 0;
    }

    function VoteForVotingEvent(uint voting_event_index) public{
        require(contributors_check[msg.sender],'You cannot vote as you did not contribute to the crowdfunding event');
        require(voting_events[voting_event_index].address_status[msg.sender] == false , 'You have already voted for the funding event');

        voting_events[voting_event_index].yes_count = voting_events[voting_event_index].yes_count + 1;
        voting_events[voting_event_index].address_status[msg.sender] = true;
    }

    function CompleteVotingEvent(uint voting_event_index) public{
        require(voting_events[voting_event_index].event_status == false, 'Voting Event Already Completed' );
        require(voting_events[voting_event_index].yes_count > (contributors_addresses.length / 2), 'more than 50% contributors have to cast their vote for voting event to close');

        voting_events[voting_event_index].destination_wallet_address.transfer(voting_events[voting_event_index].amount_to_send);
        voting_events[voting_event_index].event_status = true;
    }

}