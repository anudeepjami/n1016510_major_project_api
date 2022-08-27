const { route } = require("express/lib/application");
const userController = require("./controllers/user.controller.js");
const mailController = require("./controllers/mail.controller.js");


module.exports = app => {

  var router = require("express").Router();

  //subroute of this api
  app.use('/v1', router);

  router.get("/", (req, res) => {
    res.status(200).send("Welcome to Version 1 of Anudeep Jami N1016510 Major Project");
  });

  //Get user wallet details stored in DB
  router.put("/getwallet", userController.GetWalletDetails);

  //update user wallet details in DB or insert new user wallet details into DB
  router.post("/updatewallet", userController.UpdateWalletDetails);

  //Delete user wallet details stored in DB
  router.delete("/deletewallet", userController.DeleteWalletDetails);

  //send emails to wallet owners Email IDs for disbursal or refund requests
  router.post("/sendemail", mailController.SendEmail);

  //send emails to wallet owners Email IDs for claiming refunds
  router.post("/sendrefundemail", mailController.SendRefundEmail);

}