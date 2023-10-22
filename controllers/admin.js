const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const model = require("../models/admin.js");





router.get("/admin", async (req, res) => {
    // check if cookie is set
    if (!req.session || !req.session.admin || !req.session.isAdmin) {
        res.redirect("/admin/login");
        return;
    }
    res.render("admin/index.handlebars", {
        layout: false,
        header: {
            title: "Admin",
            keywords: "admin",
            description: "Admin panel",
        },
        user: req.session.admin,
        footer: {
            year: new Date().getFullYear(),
            site: {
                name: "HabibDev.",
                url: "/",
            },
        },
    });
});

router.get("/admin/login", async (req, res) => {
    // check if cookie is set
    if (req.session && req.session.user && req.cookies.user_sid) {
        res.redirect("/admin");
    } else {
        const error = req.session.errorMessage ? req.session.errorMessage : null;
        delete req.session.errorMessage;
        res.render("admin/login.handlebars", {
            layout: false,
            header: {
                title: "Login",
                keywords: "login, admin",
                description: "Login to admin panel",
            },
            email: "",
            error: error,
            footer: {
                year: new Date().getFullYear(),
                site: {
                    name: "HabibDev.",
                    url: "/",
                },
            }
        });
    }
});

router.post("/admin/login", async (req, res) => {
    const {
        email,
        password
    } = req.body;

    // hash password using sha256
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // check if user exists
    const result = await model.getUser(email);
    if (result === undefined) {
        req.session.errorMessage = "Invalid email or password.";
        res.redirect("/admin/login");
        return;
    }
    if (
        result.email_address === email &&
        (await bcrypt.compare(password, result.password))
    ) {
        // remove password from result
        delete result.password;
        // create session and set cookie
        req.session.admin = result;
        req.session.isAdmin = true;
        res.cookie("admin_sid", req.sessionID, {
            expires: new Date(Date.now() + 3600000),
            httpOnly: true,
        });
        res.redirect("/admin");
        return;
    } else {
        res.redirect("/admin/login", {});
        return;
    }
});

router.get("/admin/profile", async (req, res) => {
    // check if cookie is set
    if (!req.session || !req.session.admin || !req.session.isAdmin) {
        res.redirect("/admin/login");
        return;
    }
    res.render("admin/profile.handlebars", {
        layout: false,
        header: {
            title: "Profile",
            keywords: "profile, admin",
            description: "Admin profile",
        },
        user: req.session.user,
        registeredSince: new Date(req.session.user.created_at).toDateString(),
        footer: {
            year: new Date().getFullYear(),
            site: {
                name: "HabibDev.",
                url: "/",
            },
        },
    });
});

router.post("/admin/profile", async (req, res) => {
    // if user is not logged in, redirect to login page
    if (!req.session || !req.session.admin || !req.session.isAdmin) {
        res.redirect("/admin/login");
    }

    // if password field is empty, redirect to profile page
    if (req.body.password === "") {
        res.redirect("/admin/profile");
    }

    const {
        firstName,
        lastName,
        emailAddress,
        password
    } = req.body;

    // hash password using sha256
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const updated_user = {
        admin_id: req.session.user.admin_id,
        first_name: firstName,
        last_name: lastName,
        email_address: emailAddress,
        password: hashedPassword,
        created_at: req.session.user.created_at,
        updated_at: new Date().toISOString(),
    };
    // update user
    const result = await model.updateUser(updated_user);

    if (result) {
        // update session
        req.session.user.first_name = firstName;
        req.session.user.last_name = lastName;
        req.session.user.email_address = emailAddress;
        res.redirect("/admin/profile");
        return;
    } else {
        res.redirect("/admin/profile");
        return;
    }
});

router.get("/admin/logout", async (req, res) => {
    if (!req.session || !req.session.admin || !req.session.isAdmin) {
        res.redirect("/admin/login");
        return;
    }
    req.session.destroy();
    res.redirect("/admin/login");
    return;
});



module.exports = router;