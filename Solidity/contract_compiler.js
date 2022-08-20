const sol_compiler = require('solc');
const fs = require('fs');

var input_code = {
    language: 'Solidity',
    sources: {
        'CrowdfundingEvents.sol' : {
            content: fs.readFileSync('./Solidity/sol_contracts/CrowdfundingEvents.sol', 'utf-8')
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
    fs.writeFileSync('Solidity/compiled_contracts/CrowdfundingEvents.json', JSON.stringify(output_code, null, 4));
    console.log("JSON storage success");
} catch (error) {
    console.error(err);
}

exports.contract = output_code;
