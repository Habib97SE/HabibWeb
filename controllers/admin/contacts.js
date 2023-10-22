const express = require("express");
const router = express.Router();
const model = require("../../models/admin/contacts.js");

router.get("/admin/contacts", async (req, res) => {
    if (!req.session || !req.session.user) {
        res.redirect("/admin/login");
        return;
    }
    const error = req.session.errorMessage ? req.session.errorMessage : null;
    delete req.session.errorMessage;
    const contacts = await model.getContacts();
    res.render("admin/contact.handlebars", {
        layout: false,
        header: {
            title: "Contact",
            keywords: "contact, admin",
            description: "Contact",
        },
        error: error,
        user: req.session.user,
        model: contacts,
        footer: {
            year: new Date().getFullYear(),
            site: {
                name: "HabibDev.",
                url: "/",
            }
        }
    })
})

router.get("/admin/contacts/handle/:id", async (req, res) => {
    if (!req.session || !req.session.user) {
        res.redirect("/admin/login");
        return;
    }
    const id = req.params.id;
    const result = await model.markAsHandled(id);
    if (result) {
        res.redirect("/admin/contacts");
        return;
    } else {
        req.session.errorMessage = "Something went wrong. Please try again.";
        res.redirect("/admin/contacts");
        return;
    }
})

module.exports = router;