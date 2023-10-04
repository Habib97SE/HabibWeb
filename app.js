const express = require("express");
const exphbs = require("express-handlebars");
const port = 8000;

const sqlite3 = require("sqlite3");
const path = require("path");
const frontController = require("./controllers/front");
const bodyParser = require("body-parser");
// load the database
const db = new sqlite3.Database("./database.db");

const app = express();

// configure the body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// configure the template engine
app.engine(
  "handlebars",
  exphbs.engine({
    defaultLayout: "main.handlebars",
    partialsDir: path.join(__dirname, "views/partials"),
  })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// configure the static folder
app.use(express.static("public"));

app.use(frontController);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
