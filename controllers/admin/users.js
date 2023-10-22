const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const model = require("../../models/admin/users.js");


router.get("/", async (req, res) => {
    if (!req.session || !req.session.admin || !req.session.isAdmin) {
        res.redirect("/admin/login");
        return;
    }
    const users = await model.getUsers();
    // rename all admin_id and user_id to id

    res.render("admin/users/index.handlebars", {
        layout: false,
        header: {
            title: "Admin",
            keywords: "admin",
            description: "Admin panel",
        },
        user: req.session.admin,
        users: users,
        footer: {
            year: new Date().getFullYear(),
            site: {
                name: "HabibDev.",
                url: "/",
            },
        },
    });
})

router.get("/edit", async (req, res) => {
    if (!req.session || !req.session.admin || !req.session.isAdmin) {
        res.redirect("/admin/login");
        return;
    }
    const role = req.query.role;
    const id = req.query.id;
    const user = (role === "user") ? await model.getUser(id) : await model.getAdmin(id);

    const error = req.session.errorMessage || null;
    delete req.session.errorMessage;
    res.render("admin/users/show.handlebars", {
        layout: false,
        header: {
            title: "Admin",
            keywords: "admin",
            description: "Admin panel",
        },
        user: req.session.admin,
        error: error,
        showUser: user,
        footer: {
            year: new Date().getFullYear(),
            site: {
                name: "HabibDev.",
                url: "/",
            },
        },
    });
})

router.post("/edit", async (req, res) => {
    if (!req.session || !req.session.admin || !req.session.isAdmin) {
        res.redirect("/admin/login");
        return;
    }
    const role = req.query.role;
    const id = req.query.id;
    const user = (role === "user") ? await model.getUser(id) : await model.getAdmin(id);

    if (user.hasError) {
        req.session.errorMessage = "User not found.";
        res.redirect("/admin/users");
        return;
    }

    const password = req.body.password;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const email_address = req.body.email_address;

    if (first_name === "" || last_name === "" || email_address === "" || password === "") {
        req.session.errorMessage = "Please fill in all fields.";
        res.redirect(`/admin/users/edit?role=${role}&id=${id}`);
        return;
    }
    if (password.length < 8) {
        req.session.errorMessage = "Password must be at least 8 characters.";
        res.redirect(`/admin/users/edit?role=${role}&id=${id}`);
        return;
    }

    const updated_at = new Date().toISOString();
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    const updatedUser = (role === "user") ? await model.updateUser(id, first_name, last_name, email_address, hash, updated_at) : await model.updateAdmin(id, first_name, last_name, email_address, hash, updated_at);

    if (updatedUser.hasError) {
        req.session.errorMessage = "Error updating user.";
        res.redirect(`/admin/users/edit?role=${role}&id=${id}`);
        return;
    } else {
        res.redirect("/admin/users");
        return;
    }
});

router.get("/delete", async (req, res) => {
    if (!req.session || !req.session.admin || !req.session.isAdmin) {
        res.redirect("/admin/login");
        return;
    }
    const role = req.query.role;
    const id = req.query.id;
    if (role === "admin") {
        await model.deleteAdmin(id);
    } else {
        await model.deleteUser(id);
    }
    res.redirect("/admin/users");
});


router.get("/new", async (req, res) => {
    if (!req.session || !req.session.admin || !req.session.isAdmin) {
        res.redirect("/admin/login");
        return;
    }
    const error = req.session.errorMessage || null;

    delete req.session.errorMessage;
    res.render("admin/users/new.handlebars", {
        layout: false,
        header: {
            title: "Admin",
            keywords: "admin",
            description: "Admin panel",
        },
        user: req.session.admin,
        error: error,

        footer: {
            year: new Date().getFullYear(),
            site: {
                name: "HabibDev.",
                url: "/",
            },
        },
    });
});

router.post("/new", async (req, res) => {
    if (!req.session || !req.session.admin || !req.session.isAdmin) {
        res.redirect("/admin/login");
        return;
    }
    const role = req.query.role;
    const password = req.body.password;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const email_address = req.body.email_address;
    const confirm_password = req.body.confirm_password;

    if (first_name === "" || last_name === "" || email_address === "" || password === "" || confirm_password === "") {
        req.session.errorMessage = "Please fill in all fields.";
        res.redirect(`/admin/users/new`);
        return;
    }

    if (password.length < 8) {
        req.session.errorMessage = "Password must be at least 8 characters.";
        res.redirect(`/admin/users/new`);
        return;
    }

    if (password !== confirm_password) {
        req.session.errorMessage = "Passwords do not match.";
        res.redirect(`/admin/users/new`);
        return;
    }

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    const created_at = new Date().toISOString();
    const updated_at = new Date().toISOString();
    const newUser = (role === "user") ? await model.createUser(first_name, last_name, email_address, hash, created_at, updated_at) : await model.createAdmin(first_name, last_name, email_address, hash, created_at, updated_at);

    if (newUser.hasError) {
        req.session.errorMessage = "Error creating user.";
        res.redirect(`/admin/users/new`);
        return;
    } else {
        res.redirect("/admin/users");
        return;
    }
});



module.exports = router;