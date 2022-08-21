// Refer references from "Node JS & Solidity References.pdf" in root folder of this application
const sol_compiler = require('solc');
const fs = require('fs');

//structure solidity file in defined structure to generate compiles code
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

// compile Solidity code using solidity compiler
const output_code = JSON.parse(sol_compiler.compile(JSON.stringify(input_code)));

//store compiled solidity code in JSON file
try {
    fs.writeFileSync('Solidity/compiled_contracts/CrowdfundingEvents.json', JSON.stringify(output_code, null, 4));
    console.log("JSON storage success");
} catch (error) {
    console.error(err);
}


