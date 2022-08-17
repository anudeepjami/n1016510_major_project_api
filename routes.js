const { route } = require("express/lib/application");
const userController = require("./controllers/user.controller.js");


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


}