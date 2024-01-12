const express = require('express');
const router = express.Router();
const model = require("../../models/admin/projects.js");
const formidable = require("formidable");
const path = require("path");
const fs = require("fs");

router.get("/new", async (req, res) => {


    if (!req.session || !req.session.admin || !req.session.isAdmin) {
        return res.redirect("/admin/login");
    }
    const error = req.session.errorMessage ? req.session.errorMessage : null;
    delete req.session.errorMessage;
    res.render("admin/projects/new_project.handlebars", {
        header: {
            title: "New Project",
            keywords: "new, project, admin",
            description: "New project",
        },
        layout: false,
        action: "/admin/projects/new",
        error: error,
        submitButtonText: "Add New Project",
        user: req.session.admin,
        footer: {
            year: new Date().getFullYear(),
            site: {
                name: "HabibDev.",
                url: "/",
            }
        }
    });
});

router.get("/", async (req, res) => {
    if (!req.session || !req.session.admin || !req.session.isAdmin) {
        return res.redirect("/admin/login");
    }

    // Use query parameter to determine the current page, default to 1 if not provided
    let currentPage = parseInt(req.query.page) || 1;

    let limit = 3;
    let offset = (currentPage - 1) * limit; // Calculate the correct offset based on the current page
    let totalRows = await model.countRows("Projects");
    totalRows = totalRows['count'];
    let totalPages = Math.ceil(totalRows / limit); // Use Math.ceil to ensure you have enough pages for all items

    // Calculate next and previous page numbers, ensuring they stay within valid range
    let nextPage = currentPage < totalPages ? currentPage + 1 : null;
    let prevPage = currentPage > 1 ? currentPage - 1 : null;
    let projects = await model.getProjects(limit, offset);


    res.render("admin/projects/projects.handlebars", {
        layout: false,
        header: {
            title: "Projects",
            keywords: "projects, admin",
            description: "Projects",
        },
        user: req.session.admin,
        model: projects,
        hasMultiplePages: totalPages > 1,
        prev: prevPage,
        next: nextPage,
        currentPage: currentPage,
        totalPages: totalPages,
        footer: {
            year: new Date().getFullYear(),
            site: {
                name: "HabibDev.",
                url: "/",
            }
        }
    }); // end res.render()
}); // end router.get()



router.get("/:id", async (req, res) => {
    if (!req.session || !req.session.admin || !req.session.isAdmin) {
        res.redirect("/admin/login");
    }
    const id = req.params.id;
    const result = await model.getProject(id);
    if (result) {
        res.render("admin/projects/show_project.handlebars", {
            layout: false,
            header: {
                title: result.title,
                keywords: "project, admin",
                description: "Project",
            },
            user: req.session.admin,
            model: result,
            footer: {
                year: new Date().getFullYear(),
                site: {
                    name: "HabibDev.",
                    url: "/",
                }
            }
        }); // end res.render()
    } else {
        res.redirect("/admin/projects");
    }
}); // end router.get()

router.get("/delete/:id", async (req, res) => {
    if (!req.session || !req.session.admin || !req.session.isAdmin) {
        res.redirect("/admin/login");
        return;
    }
    const id = req.params.id;
    const result = await model.deleteProject(id);
    if (result) {
        res.redirect("/admin/projects");
        return;
    } else {
        res.redirect("/admin/projects");
        return;
    }
}); // end router.get()

router.get("/edit/:id", async (req, res) => {
    if (!req.session || !req.session.admin || !req.session.isAdmin) {
        res.redirect("/admin/login");
        return;
    }
    const id = req.params.id;
    const result = await model.getProject(id);
    const error = req.session.errorMessage ? req.session.errorMessage : null;
    delete req.session.errorMessage;

    if (result) {
        res.render("admin/projects/edit_project.handlebars", {
            layout: false,
            header: {
                title: "Edit the project: " + result.title,
                keywords: "edit, project, admin",
                description: "Edit project",
            },
            action: "/admin/projects/edit/" + id,
            user: req.session.admin,
            model: result,
            error: error,
            submitButtonText: "Update",
            footer: {
                year: new Date().getFullYear(),
                site: {
                    name: "HabibDev.",
                    url: "/",
                }
            }
        }); // end res.render()
    } else {
        res.redirect("/admin/projects");
        return;
    }
}); // end router.get()

router.post("/edit/:id", async (req, res) => {
    if (!req.session || !req.session.admin || !req.session.isAdmin) {
        return res.redirect("/admin/login");
    }

    const project = await model.getProject(req.params.id);
    if (!project) {
        req.session.errorMessage = "Project not found.";
        return res.redirect("/admin/projects");
    }

    let filePath = project.project.main_image;

    const form = new formidable.IncomingForm({
        allowEmptyFiles: true,
        minFileSize: 0,
    });

    form.parse(req, async (err, fields, files) => {
        const id = req.params.id;
        if (err) {
            req.session.errorMessage = "Error parsing the form.";
            return res.redirect("/admin/projects/edit/" + id);
        }

        // check if user has chosen an image to upload 

        if (files.image && files.image[0].size > 0) {
            const uploadedFile = files.image;
            const oldpath = uploadedFile.filepath;
            const newpath = path.join(__dirname, "../../public/images/" + uploadedFile.originalFilename);
            filePath = "/images/" + uploadedFile.originalFilename;

            try {
                await fs.promises.rename(oldpath, newpath);
            } catch (err) {
                req.session.errorMessage = "Failed to upload image.";
                res.redirect("/admin/projects/edit/" + id);
                return;
            }
        }

        const title = fields.title[0].trim();
        const content = fields.content[0].trim();

        if (title === "" || content === "") {
            req.session.errorMessage = "Title and content are required.";
            res.redirect("/admin/projects/edit/" + id);
            return;
        }

        console.dir(filePath);

        const editedProject = {
            project_id: parseInt(id),
            title: title,
            content: content,
            main_image: filePath,
            updated_at: new Date().toISOString()
        };

        try {
            const result = await model.updateProject(editedProject);
            if (result) {
                res.redirect("/admin/projects");
                return;
            } else {
                throw new Error('Failed to update the project.');
            }
        } catch (error) {
            console.error("Error updating project:", error);
            req.session.errorMessage = "Something went wrong. Please try again.";
            res.redirect("/admin/projects/edit/" + id);
            return;
        }
    }); // end form.parse()
}); // end router.post()




router.post("/new", async (req, res) => {
    if (!req.session || !req.session.admin || !req.session.isAdmin) {
        return res.redirect("/admin/login");
    }

    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
        if (err) {
            req.session.errorMessage = "Error parsing the form.";
            res.redirect("/admin/projects/new");
            return;
        }

        let uploadedFile = files.image[0];
        let oldpath = uploadedFile.filepath;
        let newpath = path.join(__dirname, "../../public/images/" + uploadedFile.originalFilename);
        let filePath = "/images/" + uploadedFile.originalFilename;

        fs.rename(oldpath, newpath, function (err) {
            if (err) {
                req.session.errorMessage = "Failed to upload image.";
                res.redirect("/admin/projects/new");
                return;
            }

        }); // end fs.rename()

        const title = fields.title[0].trim();
        const content = fields.content[0].trim();
        if (title === "" || content === "") {
            req.session.errorMessage = "Title and content are required.";
            res.redirect("/admin/projects/new");
            return;
        }

        const project = {
            title: title,
            content: content,
            main_image: filePath,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        try {
            const result = await model.addProject(project);
            if (result) {
                res.redirect("/admin/projects");
                return;
            } else {
                req.session.errorMessage = "Something went wrong. Please try again.";
                res.redirect("/admin/projects/new");
                return;
            }
        } catch (error) {
            console.error("Error adding project:", error);
            req.session.errorMessage = "An error occurred while adding the project.";
            res.redirect("/admin/projects/new");
            return;
        }
    });
});


module.exports = router;