const { route } = require("express/lib/application");
//const Jwt = require("../models/middleware.js");


module.exports = app => {

  var router = require("express").Router();

  //router.use(Jwt.authenticateToken);
  app.use('/v1', router);

  router.get("/", (req, res) => {
    res.status(200).send("Welcome to Version 1 of Anudeep Jami N1016510 Major Project");
});

  router.get("/mail", (req, res) => {
    // using Twilio SendGrid's v3 Node.js Library
    // https://github.com/sendgrid/sendgrid-nodejs

    const sgMail = require('@sendgrid/mail')
    sgMail.setApiKey("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")
    const msg = {
      to: 'anudeep.jami@gmail.com', // Change to your recipient
      from: 'admin@anudeepjami-crowdfunding.me', // Change to your verified sender
      subject: 'Sending with SendGrid is Fun',
      text: 'and easy to do anywhere, even with Node.js',
      html: '<strong>and easy to do anywhere, even with Node.js</strong>',
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


//   //// accessing Companies Market Cap Controller
//   const companiescontroller = require("../controllers/companies.controller.js");

//   //put for get companies
//   router.put("/companies", companiescontroller.getCompanies)

};