const mysql2 = require("../MySQL/mysql2.js");

const User = function () {

}

//get wallet details from mysql db
User.GetWalletDetails = (body, result) => {
    mysql2.query("select * from `crowdfunding_data` where `wallet_address`= ?", body.wallet_address, (err, res) => {
        if (err) {
            //returns any db errors
            result(err, null);
        }
        // returns db results
        result(null, res);
    });
};

//get wallets from mysql db
User.GetWallets = (result) => {
    mysql2.query("select * from `crowdfunding_data`", (err, res) => {
        if (err) {
            //returns any db errors
            result(err, null);
        }
        // returns db results
        result(null, res);
    });
};

//update wallet details in mysql db
User.UpdateWallet = async (body, result) => {
    //updates wallet details in db
    mysql2.query("update `crowdfunding_data` set email_id = ? where `wallet_address`= ?", [body.email_id, body.wallet_address], (err, res) => {
        if (err) {
            //returns any db errors
            result(err, null);
        }
        // returns db results
        result(null, res);
    });
};

//Insert wallet details to mysql db
User.InsertWallet = async (body, result) => {
    //Inserts wallet details to db
    mysql2.query("insert into `crowdfunding_data`(wallet_address, email_id) values (?)", [[body.wallet_address, body.email_id]], (err, res) => {
        if (err) {
            //returns any db errors
            result(err, null);
        }
        // returns db results
        result(null, res);
    });
};

module.exports = User;