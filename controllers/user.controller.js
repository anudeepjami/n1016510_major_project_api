const User = require('../models/user.model.js');


//Get user wallet details stored in db
exports.GetWalletDetails = async (req, res) => {

    // get user wallet details from db
    User.GetWalletDetails(req.body, async (err, wallet_address) => {
        if (err) {
            const message = {
                message:
                    err.message || "error while fetching wallet details"
            };
                res.status(200).send(message);
        }
        else {
                res.status(200).send(wallet_address);
        }
    });
};