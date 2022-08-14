// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

contract Lottery{

    address public manager;
    address[] public players;
    address payable public winner;

    constructor(){
        manager = msg.sender;
    }

    function enter() public payable{
        require(msg.value > 0.1 ether);
        players.push(msg.sender);
    }

    function random() private view returns (uint){
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, players)));
    }

    function pickWinner() public onlyManager{
        uint index = random() % players.length;
        winner = payable(players[index]);
        winner.transfer(address(this).balance);
        players = new address[](0);
    }

    modifier onlyManager() {
        require(manager == msg.sender);
        _;
    }

    function getPlayers() public view returns (address[] memory){
        return players;
    }

}