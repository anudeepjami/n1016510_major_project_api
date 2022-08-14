// assert package helps in comparing test results
const { doesNotMatch } = require('assert');
const assert = require('assert');
// import ganache package
const ganache = require('ganache');
// import web3 package
const Web3 = require('web3')

// create instance of Web3 with local ganche network
const web3 = new Web3(ganache.provider());

// exporting compiled solidity code
const contract = require('../Solidity/compiled_contracts/lottery.json');
console.log(contract);

let ganache_accnts = [];
let contract_instance;

beforeEach(async () => {
    // extract all ganache accounts
    ganache_accnts = await web3.eth.getAccounts();
    //console.log(ganache_accnts);

    // deploy ethereum contract to ganache
    contract_instance = await new web3.eth.Contract(contract.contracts['lottery.sol']['Lottery'].abi)
        .deploy({data: contract.contracts['lottery.sol']['Lottery'].evm.bytecode.object})
        .send( {from: ganache_accnts[0], gas: '1000000'});
    //console.log(contract_isntance);
});

describe('lottery',  () => {
    it('manager compare', async () => {
        var manager = await contract_instance.methods.manager().call()
        assert.equal(manager, ganache_accnts[0]);
    });
    it('entry', async () => {
        await contract_instance.methods.enter().send({
            from: ganache_accnts[0],
            value: web3.utils.toWei('0.2', 'ether')
        })
        await contract_instance.methods.enter().send({
            from: ganache_accnts[1],
            value: web3.utils.toWei('0.2', 'ether')
        })
        const players = await contract_instance.methods.getPlayers().call();
        assert.equal(players[0], ganache_accnts[0]);
        assert.equal(players[1], ganache_accnts[1]);
    });
    it('entry min fail', async () => {
        try {
            await contract_instance.methods.enter().send({
                from: ganache_accnts[0],
                value: web3.utils.toWei('0.01', 'ether')
            })
            throw 'test case should fail';
        } catch (error) {
            assert.notEqual(error,'test case should fail');
        }
    });

}

);