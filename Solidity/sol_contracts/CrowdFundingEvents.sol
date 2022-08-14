// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

contract CrowdFundingEvents{
    address public crowdfunding_admin;
    crowd_funding_event[] public crowdFundingEventAddresses;

    struct crowd_funding_event {
        address fund_manager;
        address fund_address;
    }

    constructor(){
        crowdfunding_admin = msg.sender;
    }

    function AddFundingEvent(address _fund_address) public{
        crowdFundingEventAddresses.push(
            crowd_funding_event(
                msg.sender,
                _fund_address
            )
        );
    }

    function GetFundingEvents() public view returns (crowd_funding_event[] memory){
        return crowdFundingEventAddresses;
    }

}