// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

contract Inbox{
    string public message = "intial message - Hi World";

    function inbox() public{
        message = "intial message - Hi World";
    }

    function setMessage(string memory newMessage) public{
        message = newMessage;
    }

}