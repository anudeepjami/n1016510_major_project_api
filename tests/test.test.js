// // assert package helps in comparing test results
// const assert = require('assert');
// // import ganache package
// const ganache = require('ganache');
// // import web3 package
// const Web3 = require('web3')

// // create instance of Web3 with local ganche network
// const web3 = new Web3(ganache.provider());

// // exporting compiled solidity code
// const contract = require('../Solidity/compiled_contracts/test.json');
// console.log(contract);

// let ganache_accnts = [];
// let contract_instance;

// beforeEach(async () => {
//     // extract all ganache accounts
//     ganache_accnts = await web3.eth.getAccounts();
//     //console.log(ganache_accnts);

//     // deploy ethereum contract to ganache
//     contract_instance = await new web3.eth.Contract(contract.contracts['test.sol']['Inbox'].abi)
//         .deploy({data: contract.contracts['test.sol']['Inbox'].evm.bytecode.object})
//         .send( {from: ganache_accnts[0], gas: '1000000'});
//     //console.log(contract_isntance);
// });

// describe('Test',  () => {
//     it('contract deployment success', async () => {
//         var msg = await contract_instance.methods.message().call()
//         assert.equal(msg,'intial message - Hi World');
//     });

//     it('update message', async () => {
//         await contract_instance.methods.setMessage('updated message').send({from: ganache_accnts[0]})
//         var msg = await contract_instance.methods.message().call()
//         assert.equal(msg,'updated message');
//     });
// }

// );