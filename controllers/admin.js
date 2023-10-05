const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const router = express.Router();
const model = require("../models/admin.js");

router.get("/admin", async (req, res) => {
  // check if cookie is set
  if (req.session && req.session.user && req.cookies.user_sid) {
    res.render("admin/index.handlebars", {
      layout: false,
      header: {
        title: "Admin",
        keywords: "admin",
        description: "Admin panel",
      },
      user: req.session.user,
    });
  } else {
    res.redirect("/admin/login");
  }
});

router.get("/admin/login", async (req, res) => {
  // check if cookie is set
  if (req.session && req.session.user && req.cookies.user_sid) {
    res.redirect("/admin");
  } else {
    res.render("admin/login.handlebars", {
      layout: false,
      header: {
        title: "Login",
        keywords: "login, admin",
        description: "Login to admin panel",
      },
      email: "",
      error: "",
    });
  }
});

router.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;

  // hash password using sha256
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // check if user exists
  const result = await model.getUser(email);

  if (
    result.email_address === email &&
    (await bcrypt.compare(password, result.password))
  ) {
    // remove password from result
    delete result.password;
    // create session and set cookie
    req.session.user = result;
    res.cookie("user_sid", req.sessionID, {
      expires: new Date(Date.now() + 3600000),
      httpOnly: true,
    });
    res.redirect("/admin");
  } else {
    res.redirect("/admin/login", {
      layout: false,
      header: {
        title: "Login",
        keywords: "login, admin",
        description: "Login to admin panel",
      },
      error: "Invalid email address or password.",
      email: emailAddress,
      password: password,
    });
  }
});

module.exports = router;
