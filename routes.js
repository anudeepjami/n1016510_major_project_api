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

  //Get user wallet details stored in db
  router.put("/getwallet", userController.GetWalletDetails);

  //update user wallet details or insert new user wallet details stored in db
  router.post("/updatewallet", userController.UpdateWalletDetails);

  //send emails to wallet owners email id's for voting event
  router.post("/sendemail", mailController.SendEmail);

  router.get("/mail", (req, res) => {
    // using Twilio SendGrid's v3 Node.js Library
    // https://github.com/sendgrid/sendgrid-nodejs

    const sgMail = require('@sendgrid/mail')
    sgMail.setApiKey("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")
    const msg = {
      to: 'anudeep.jami@gmail.com', // Change to your recipient
      from: 'admin@anudeepjami-crowdfunding.me', // Change to your verified sender
      subject: 'Sending with SendGrid is Fun',
      html: "<div><h2><a href='https://anudeepjami-crowdfunding.me/'>AJ Hybrid Crowdfunding Funding Platform</a></h2>"+
      "<h3>Voting Event Alert ...!</h3>"+
      "<p>As you are a contributor for campaign 'Art event' with contract address '0x28fF8A3947A66E7ad0D345E5c7563554bcdD4228'. "+
          "You are requested to vote for the following voting event created as part of this campaign</p>"+
      "<p>Voting Event Title: 'event1' <br/> Voting Event Description: 'event1'</p>"+
      "<p>For More Details <a href='https://anudeepjami-crowdfunding.me/vote'>click here</a> to visit the voting event</p></div>",
    }
    sgMail
      .send(msg)
      .then(() => {
        res.status(200).send("email success");
      })
      .catch((error) => {
        res.status(200).send(error);
      })

  });


}