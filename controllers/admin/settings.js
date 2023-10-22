const express = require('express');
const router = express.Router();
const model = require("../../models/admin/settings.js");

router.get("/admin/settings", async (req, res) => {
    if (!req.session || !req.session.user) {
        res.redirect("/admin/login");
        return;
    }
    const settingsModel = await model.getSettings();
    const error = req.session.errorMessage ? req.session.errorMessage : null;
    delete req.session.errorMessage;
    res.render("admin/settings/settings.handlebars", {
        layout: false,
        header: {
            title: "Settings",
            keywords: "settings, admin",
            description: "Settings",
        },
        settings: settingsModel,
        user: req.session.user,
        error: error,
        success: req.query.success,
        empty: req.query.empty,
        footer: {
            year: new Date().getFullYear(),
            site: {
                name: "HabibDev.",
                url: "/",
            }
        }
    });
}); // end router.get()

router.post("/admin/settings", async (req, res) => {
    if (!req.session || !req.session.user) {
        res.redirect("/admin/login");
        return;
    }

    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
        let numberOfFields = Object.keys(fields).length;
        let settings = {};
        for (let i = 0; i < numberOfFields; i++) {
            if (Object.values(fields)[i] === "") {
                req.session.errorMessage = "All field are required.";
                res.redirect("/admin/settings");
                return;
            }
            settings = Object.entries(fields).map(([key, value]) => ({
                [key]: value
            }));
        }
        const result = await model.updateSettings(settings);
        if (result == true) {
            res.redirect("/admin/settings?success=true");
            return;
        } else {
            req.session.errorMessage = "Something went wrong. Please try again.";
            res.redirect("/admin/settings");
            return;
        }

    }) // end form.parse()

});

router.get("/admin/settings/new", async (req, res) => {
    if (!req.session || !req.session.user) {
        res.redirect("/admin/login");
        return;
    }
    const error = req.session.errorMessage ? req.session.errorMessage : null;
    delete req.session.errorMessage;
    res.render("admin/settings/new_settings.handlebars", {
        layout: false,
        header: {
            title: "Settings",
            keywords: "settings, admin",
            description: "Settings",
        },
        settings: {},
        user: req.session.user,
        error: error,
        footer: {
            year: new Date().getFullYear(),
            site: {
                name: "HabibDev.",
                url: "/",
            }
        }
    });
}); // end router.get()

router.post("/admin/settings/new", async (req, res) => {
    if (!req.session || !req.session.user) {
        res.redirect("/admin/login");
        return;
    }
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
        if (err) {
            req.session.errorMessage = "Something went wrong. Please try again.";
            res.redirect("/admin/settings/new", {});
            return;
        }

        // check if setting_name and setting_value are not empty
        if (fields.setting_name[0].trim() === "" || fields.setting_value[0].trim() === "") {
            req.session.errorMessage = "All fields are required.";
            res.redirect("/admin/settings/new", {}) // end res.redirect()
            return;
        }

        let setting = {};

        setting["setting_name"] = fields.setting_name[0];
        setting["setting_value"] = fields.setting_value[0];

        const result = await model.addSetting(setting);
        if (result) {
            res.redirect("/admin/settings");
            return;
        } else {
            req.session.errorMessage = "Something went wrong. Please try again.";
            res.redirect("/admin/settings/new", {});
            return;
        }
    }) // end form.parse()
});

module.exports = router;