const express = require("express");
const cors = require("cors");
const app = express();
const mysql2 = require ("./MySQL/mysql2")

//Adding Cross-origin resource sharing
var corsOptions = {
  origin: ["http://localhost:3000","https://aj-major-project-ui.azurewebsites.net"],
};
app.use(cors(corsOptions));


// XML and JSON parsing by default
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root path of application
app.get("/", (req, res) => {
    res.status(200).send("Welcome to Anudeep Jami N1016510 Major Project");
});

// setting up routes files
require("./routes.js")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {console.log(`API is serving at http://localhost:`+PORT);});

