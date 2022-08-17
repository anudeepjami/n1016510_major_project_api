const mysql2 = require("../MySQL/mysql2.js");

const User = function() {

}

//get userdetails my mysql db
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

module.exports = User;