// Refer references from "Node JS & Solidity References.pdf" in root folder of this application
const User = require('../models/user.model.js');
var CryptoJS = require("crypto-js");
var secret = 'test1234';

//Get user wallet details stored in db
exports.GetWalletDetails = async (req, res) => {

    // get user wallet details from db
    User.GetWalletDetails(req.body, async (err, wallet_details) => {
        if (err) {
            res.status(200).send({ message: err.message });
        }
        else {
            var temp = wallet_details;
            if (temp.length == 1){
                temp[0].email_id = CryptoJS.AES.decrypt(temp[0].email_id, secret).toString(CryptoJS.enc.Utf8);
            }
            res.status(200).send(temp);
        }
    });
};

//Update or insert user wallet details stored in db
exports.UpdateWalletDetails = async (req, res) => {

    var input = req;
    input.body.email_id = CryptoJS.AES.encrypt(input.body.email_id, secret).toString();
    // Update or insert user wallet details in db
    User.GetWalletDetails(input.body, async (err, wallet_details) => {
        if (err) {
            res.status(200).send({ message: err.message });
        }
        else {
            if (wallet_details.length != 0){
                // update wallet details of user in db if exists in db
                User.UpdateWallet(input.body, async (err, message) => {
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
                User.InsertWallet(input.body, async (err, message) => {
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