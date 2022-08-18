const User = require('../models/user.model.js');
const Email = require('@sendgrid/mail');


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
            const fromAddress = 'admin@anudeepjami-crowdfunding.me';
            const emailSubject = 'AJ Hybrid Crowdfunding Funding Platform';
            const emailBody = "<div><h2><a href='https://anudeepjami-crowdfunding.me/'>AJ Hybrid Crowdfunding Funding Platform</a></h2>" +
                "<h3>Voting Event Alert ...!</h3>" +
                "<p>As you are a contributor for campaign '"+ req.body.fundDetails[0]+
                "' with contract address '"+req.body.fundAddress+"'. " +
                "You are requested to vote for the following voting event created as part of this campaign</p>" +
                "<p>Voting Event Title: '"+req.body.votingEventDetails[0]+
                "' <br/> Voting Event Description: '"+req.body.votingEventDetails[1]+"."+
                "<br/>For More Details <a href='https://anudeepjami-crowdfunding.me/vote?"+
                "FundAddress="+req.body.fundAddress+"&"+"VotingIndex="+req.body.votingIndex+
                "'>click here</a> to visit the voting event</p></div>";

            Email.setApiKey("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");
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