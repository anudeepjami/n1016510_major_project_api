const sol_compiler = require('solc');
const fs = require('fs');

var input_code = {
    language: 'Solidity',
    sources: {
        'lottery.sol' : {
            content: fs.readFileSync('./Solidity/sol_contracts/lottery.sol', 'utf-8')
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': [ '*' ]
            }
        }
    }
}; 

const output_code = JSON.parse(sol_compiler.compile(JSON.stringify(input_code)));

try {
    fs.writeFileSync('Solidity/compiled_contracts/lottery.json', JSON.stringify(output_code, null, 4));
    console.log("JSON storage success");
} catch (error) {
    console.error(err);
}

exports.contract = output_code;

//console.log(output_code.contracts['test.sol']['Inbox'].abi);
//console.log(output_code.contracts['test.sol']['Inbox'].evm.bytecode.object);
