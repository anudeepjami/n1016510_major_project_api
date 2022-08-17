const User = require('../models/user.model.js');


//Get user wallet details stored in db
exports.GetWalletDetails = async (req, res) => {

    // get user wallet details from db
    User.GetWalletDetails(req.body, async (err, wallet_address) => {
        if (err) {
            res.status(200).send({ message: err.message });
        }
        else {
            res.status(200).send(wallet_address);
        }
    });
};

//Update or insert user wallet details stored in db
exports.UpdateWalletDetails = async (req, res) => {
    // Update or insert user wallet details in db
    User.GetWalletDetails(req.body, async (err, wallet_address) => {
        if (err) {
            res.status(200).send({ message: err.message });
        }
        else {
            if (wallet_address.length != 0){
                // update wallet details of user in db if exists in db
                User.UpdateWallet(req.body, async (err, message) => {
                    if (err) {
                        res.status(200).send({ message: err.message });
                    }
                    else {
                        res.status(200).send(req.body);
                    }
                });
            }
            else {
                // Insert wallet details of user into db if not exists in db
                User.InsertWallet(req.body, async (err, message) => {
                    if (err) {
                        res.status(200).send({ message: err.message });
                    }
                    else {
                        res.status(200).send(req.body);
                    }
                });
            }
        }
    });
};