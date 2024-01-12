const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const model = require("../../models/admin/users.js");


router.get("/", async (req, res) => {
    if (!req.session || !req.session.admin || !req.session.isAdmin) {
        res.redirect("/admin/login");
        return;
    }
    let users = await model.getUsers();
    if (users.hasError) {
        req.session.errorMessage = "Error getting users.";
        res.redirect("/admin");
        return;
    }

    // for (let i = 0; i < users.users.length; i++) {
    //     let user = users.users[i];
    //     const date = new Date(user.created_at);
    //     user.created_at = date.toDateString().split("T")[0];
    // }


    console.dir(users);

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
    if (role !== "user" && role !== "admin") {
        req.session.errorMessage = "Invalid role.";
        res.redirect("/admin/users");
        return;
    }
    if (role === "user") {
        const user = await model.getUser(id);
        if (user.hasError) {
            req.session.errorMessage = "User not found.";
            res.redirect("/admin/users");
            return;
        }
        const error = req.session.errorMessage || null;
        console.log(user);
        res.render("admin/users/show.handlebars", {
            layout: false,
            header: {
                title: "Admin",
                keywords: "admin",
                description: "Admin panel",
            },
            user: req.session.admin,
            role: role,
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

    } else {
        const admin = await model.getAdmin(id);
        if (admin.hasError) {
            req.session.errorMessage = "Admin not found.";
            res.redirect("/admin/users");
            return;
        }
        const error = req.session.errorMessage || null;

        res.render("admin/users/show.handlebars", {
            layout: false,
            header: {
                title: "Admin",
                keywords: "admin",
                description: "Admin panel",
            },
            user: req.session.admin,
            error: error,
            role: role,
            showUser: admin,
            footer: {
                year: new Date().getFullYear(),
                site: {
                    name: "HabibDev.",
                    url: "/",
                },
            },
        });
    }
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

    if (role === "admin") {
        const updatedAdmin = await model.updateAdmin(id, first_name, last_name, email_address, hash, updated_at);
        if (updatedAdmin.hasError) {
            req.session.errorMessage = "Error updating admin.";
            res.redirect(`/admin/users/edit?role=${role}&id=${id}`);
            return;
        } else {
            res.redirect("/admin/users");
            return;
        }
    }

    if (role === "user") {
        const updatedUser = await model.updateUser(id, first_name, last_name, email_address, hash, updated_at);
        if (updatedUser.hasError) {
            req.session.errorMessage = "Error updating user.";
            res.redirect(`/admin/users/edit?role=${role}&id=${id}`);
            return;
        } else {
            res.redirect("/admin/users");
            return;
        }
    }
    req.session.errorMessage = "Error updating user.";
    res.redirect(`/admin/users/edit?role=${role}&id=${id}`);
    return;
});

router.get("/delete", async (req, res) => {
    if (!req.session || !req.session.admin || !req.session.isAdmin) {
        res.redirect("/admin/login");
        return;
    }
    const role = req.query.role;
    const id = req.query.id;
    if (role == "admin") {
        const deletedAdmin = await model.deleteAdmin(id);
        if (deletedAdmin.hasError) {
            req.session.errorMessage = "Error deleting admin.";
            res.redirect("/admin/users");
            return;
        }
        if (role === "user") {
            const deletedUser = await model.deleteUser(id);
            if (deletedUser.hasError) {
                req.session.errorMessage = "Error deleting user.";
                res.redirect("/admin/users");
                return;
            } else {
                res.redirect("/admin/users");
                return;
            }
        }
        req.session.errorMessage = "Error deleting user.";
        res.redirect("/admin/users");
        return;
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
    const role = req.body.role;
    const password = req.body.password;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const email_address = req.body.email_address;
    const confirm_password = req.body.confirm_password;



    if (first_name === "" || last_name === "" || email_address === "" || password === "" || confirm_password === "") {
        req.session.errorMessage = "Please fill in all fields.";
        res.redirect("/admin/users/new");
        return;
    }

    if (password.length < 8) {
        req.session.errorMessage = "Password must be at least 8 characters.";
        res.redirect("/admin/users/new");
        return;
    }

    if (password !== confirm_password) {
        req.session.errorMessage = "Passwords do not match.";
        res.redirect("/admin/users/new");
        return;
    }

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    const created_at = new Date().toISOString();
    const updated_at = new Date().toISOString();


    if (role === "admin") {
        const newAdmin = await model.createAdmin(first_name, last_name, email_address, hash, created_at, updated_at);
        if (newAdmin.hasError) {
            req.session.errorMessage = "Error creating admin.";
            res.redirect("/admin/users/new");
            return;
        } else {
            res.redirect("/admin/users");
            return;
        }
    }
    if (role === "user") {
        const newUser = await model.createUser(first_name, last_name, email_address, hash, created_at, updated_at);
        if (newUser.hasError) {
            req.session.errorMessage = "Error creating user.";
            res.redirect("/admin/users/new");
            return;
        } else {
            res.redirect("/admin/users");
            return;
        }
    }
    req.session.errorMessage = "Error creating user.";
    res.redirect("/admin/users/new");
    return;
});



module.exports = router;