const express = require("express");
const exphbs = require("express-handlebars");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const sqlite3 = require("sqlite3");
const path = require("path");
const bcrypt = require("bcrypt");

// load the controllers admin area
const adminProjectController = require("./controllers/admin/projects");
const adminBlogsController = require("./controllers/admin/blogs");
const adminSettingsController = require("./controllers/admin/settings");
const adminContactsController = require("./controllers/admin/contacts");
const adminUsersController = require("./controllers/admin/users");
const adminController = require("./controllers/admin");

// laod the controller front area 
const frontController = require("./controllers/front");

const port = 8000;

const bodyParser = require("body-parser");


const app = express();

// configure the body parser
app.use(bodyParser.urlencoded({
  extended: false
}));
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
    showLocalDateTime: function (dateToFormat) {
      const date = new Date(dateToFormat);
      return date.toDateString().split("T")[0];
    }
  },
});

// configure the session and cookie parser
app.use(session({
  secret: bcrypt.genSaltSync(10),
  resave: false,
  saveUninitialized: true
}));
app.use(cookieParser());


// add tinymce to the project
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));


// configure the template engine
app.engine("handlebars", hbs.engine);

app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// configure the static folder
app.use(express.static("public"));

app.use("/admin/projects", adminProjectController);
app.use("/admin/blogs", adminBlogsController);
app.use("/admin/settings", adminSettingsController);
app.use("/admin/contacts", adminContactsController);
app.use("/admin/users", adminUsersController);



app.use(frontController);
app.use(adminController);



// Default 404 page
app.use((req, res, next) => {
  res.status(404).render("404.handlebars");
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});