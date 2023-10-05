const express = require("express");
const exphbs = require("express-handlebars");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const sqlite3 = require("sqlite3");
const path = require("path");

const frontController = require("./controllers/front");
const adminController = require("./controllers/admin");

const port = 8000;

const bodyParser = require("body-parser");
// load the database
const db = new sqlite3.Database("./database.db");

const app = express();

// configure the body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const hbs = exphbs.create({
  defaultLayout: "main.handlebars",
  partialsDir: path.join(__dirname, "views", "partials"),
  helpers: {
    firstTwentyWords: function (text) {
      let words = text.split(" ");
      let firstTwentyWords = words.slice(0, 20);
      return firstTwentyWords.join(" ");
    },
  },
});

app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// configure the template engine
app.engine("handlebars", hbs.engine);

app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// configure the static folder
app.use(express.static("public"));

app.use(frontController);
app.use(adminController);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
