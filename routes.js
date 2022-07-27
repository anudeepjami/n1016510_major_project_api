const { route } = require("express/lib/application");
//const Jwt = require("../models/middleware.js");


module.exports = app => {

  var router = require("express").Router();

  //router.use(Jwt.authenticateToken);
  app.use('/v1', router);

  router.get("/", (req, res) => {
    res.status(200).send("Welcome to Version 1 of Anudeep Jami N1016510 Major Project");
});

//   //// accessing Companies Market Cap Controller
//   const companiescontroller = require("../controllers/companies.controller.js");

//   //put for get companies
//   router.put("/companies", companiescontroller.getCompanies)

};