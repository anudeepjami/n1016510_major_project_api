// Refer references from "Node JS & Solidity References.pdf" in root folder of this application

const User = require('../models/user.model.js');
const Email = require('@sendgrid/mail');
var CryptoJS = require("crypto-js");
const email_api_key = "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";
var secret = 'test1234';

var app_domain = process.env.PORT == undefined ? 'http://localhost:3000/' : 'https://anudeepjami-crowdfunding.me/'

//Get user wallet details stored in db
exports.SendEmail = async (req, res) => {

    // get user wallet details from db
    User.GetWallets(async (err, WalletsInfo) => {
        if (err) {
            res.status(200).send({ message: err.message });
        }
        else {
            var toAddresses = [];
            req.body.fundDetails[4].forEach((item, index) => {
                WalletsInfo.forEach((item2, index2) => {
                    if(item[0].toLowerCase() == item2.wallet_address.toLowerCase())
                        toAddresses.push(item2.email_id);
                })
            });
            toAddresses.forEach((item,index)=>{
                toAddresses[index] = CryptoJS.AES.decrypt(item, secret).toString(CryptoJS.enc.Utf8);
            });
            const fromAddress = 'admin@anudeepjami-crowdfunding.me';
            const emailSubject = 'AJ Hybrid Crowdfunding Funding Platform';
            const emailBody = "<div><h2><a href='"+app_domain+"'>AJ Hybrid Crowdfunding Funding Platform</a></h2>" +
                "<h3>Voting Event Alert ...!</h3>" +
                "<p>As you are a contributor for campaign '"+ req.body.fundDetails[0]+
                "' with contract address '"+req.body.fundAddress+"'. " +
                "You are requested to vote for the following voting event created as part of this campaign</p>" +
                "<p>Voting Event Title: '"+req.body.votingEventDetails[0]+
                "' <br/> Voting Event Description: '"+req.body.votingEventDetails[1]+"."+
                "<br/>For More Details <a href='"+app_domain+"vote?"+
                "FundAddress="+req.body.fundAddress+"&"+"VotingIndex="+req.body.votingIndex+
                "'>click here</a> to visit the voting event</p></div>";

            Email.setApiKey(email_api_key);
            Email.send({
                to: toAddresses,
                from: fromAddress,
                subject: emailSubject,
                html: emailBody
            })
                .then(() => {
                    res.status(200).send({ message: " Emails sent successfully " });
                })
                .catch((e) => {
                    res.status(200).send({ message: e.message });
                })
        }
    });
};

//Get user wallet details stored in db
exports.SendRefundEmail = async (req, res) => {

    // get user wallet details from db
    User.GetWallets(async (err, WalletsInfo) => {
        if (err) {
            res.status(200).send({ message: err.message });
        }
        else {
            var toAddresses = [];
            req.body.fundDetails[4].forEach((item, index) => {
                WalletsInfo.forEach((item2, index2) => {
                    if(item[0].toLowerCase() == item2.wallet_address.toLowerCase())
                        toAddresses.push(item2.email_id);
                })
            });
            toAddresses.forEach((item,index)=>{
                toAddresses[index] = CryptoJS.AES.decrypt(item, secret).toString(CryptoJS.enc.Utf8);
            });
            const fromAddress = 'admin@anudeepjami-crowdfunding.me';
            const emailSubject = 'AJ Hybrid Crowdfunding Funding Platform';
            const emailBody = "<div><h2><a href='"+app_domain+"'>AJ Hybrid Crowdfunding Funding Platform</a></h2>" +
                "<h3 style='color:red'>Claim Refund Alert ...!</h3>" +
                "<p>As you are a contributor for campaign '"+ req.body.fundDetails[0]+
                "' with contract address '"+req.body.fundAddress+"'. " +
                "You are requested to claim your refund as the fundraising event has failed...!!!</p>" +
                "<p>Voting Event Title: '"+req.body.votingEventDetails[0]+
                "' <br/> Voting Event Description: '"+req.body.votingEventDetails[1]+"."+
                "<br/>For more details <a href='"+app_domain+"vote?"+
                "FundAddress="+req.body.fundAddress+"&"+"VotingIndex="+req.body.votingIndex+
                "'>click here</a> to claim your refund</p></div>";

            Email.setApiKey(email_api_key);
            Email.send({
                to: toAddresses,
                from: fromAddress,
                subject: emailSubject,
                html: emailBody
            })
                .then(() => {
                    res.status(200).send({ message: " Emails sent successfully " });
                })
                .catch((e) => {
                    res.status(200).send({ message: e.message });
                })
        }
    });
};