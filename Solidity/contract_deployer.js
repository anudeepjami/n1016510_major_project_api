// Refer references from "Node JS & Solidity References.pdf" in root folder of this application
const truffle_wallet = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const fs = require('fs');

//importing abi and bytecode of Crowdfunding Events Contract
const CrowdFundingEventsContract = require('./compiled_contracts/CrowdfundingEvents.json');
const crowdfundingEventsContract = {
    interface: CrowdFundingEventsContract.contracts['CrowdfundingEvents.sol']['CrowdfundingEvents'].abi,
    bytecode: CrowdFundingEventsContract.contracts['CrowdfundingEvents.sol']['CrowdfundingEvents'].evm.bytecode.object
};

//create local ganache wallet instance
const ganache_wallet_object = new truffle_wallet(
    'coin tunnel delay diamond wreck bamboo robust change muscle mule depend stem',
    'HTTP://127.0.0.1:7545'
);

var deployed_contract_addresses = {};

const web3_2 = new Web3(ganache_wallet_object);

const deploy_2 = async () => {

    const wallet_ids = await web3_2.eth.getAccounts();

    // deploy ethereum contract to ganache network
    var crowdfundingEventsContract_instance = await new web3_2.eth
        .Contract(crowdfundingEventsContract.interface)
        .deploy({ data: crowdfundingEventsContract.bytecode })
        .send({ from: wallet_ids[0] });

    deployed_contract_addresses['ganache'] = crowdfundingEventsContract_instance.options.address

    ganache_wallet_object.engine.stop();
};
deploy_2();

//create rinkeby network wallet instance
const infura_wallet_object = new truffle_wallet(
    'lizard table distance moon stage champion person air discover cave army concert',
    'https://rinkeby.infura.io/v3/d1bcda716078458b90d0962f45b0a1a2'
);

const web3 = new Web3(infura_wallet_object);

const deploy = async () => {

    const wallet_ids = await web3.eth.getAccounts();

    // deploy ethereum contract to rinkeby ethereum network
    var crowdfundingEventsContract_instance = await new web3.eth
        .Contract(crowdfundingEventsContract.interface)
        .deploy({ data: crowdfundingEventsContract.bytecode })
        .send({ from: wallet_ids[0] });

    deployed_contract_addresses['rinkeby'] = crowdfundingEventsContract_instance.options.address

    infura_wallet_object.engine.stop();

    //store contract addresses to a json file in compiled_contracts folder
    try {
        fs.writeFileSync('Solidity/compiled_contracts/ContractAddress.json', JSON.stringify(deployed_contract_addresses, null, 4));
        console.log("JSON storage success");
    } catch (error) {
        console.error(err);
    }
};
deploy();


