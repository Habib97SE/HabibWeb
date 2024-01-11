const express = require("express");
const router = express.Router();
const model = require("../../models/admin/blogs.js");
const formidable = require("formidable");
const path = require("path");
const fs = require("fs");




router.get("/new", async (req, res) => {
    // check if cookie is set
    if (!req.session || !req.session.admin || !req.session.isAdmin) {
        res.redirect("/admin/login");
        return;
    }
    const error = req.session.errorMessage ? req.session.errorMessage : null;
    delete req.session.errorMessage;
    res.render("admin/blogs/post.handlebars", {
        layout: false,
        header: {
            title: "Add Blog",
            keywords: "add, blog, admin",
            description: "Add blog",
        },
        error: error,
        action: "/admin/blogs/new",
        submitButtonText: "Add New Blog",
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


/**
 * @route GET /admin/blogs
 * @description Get blogs
 * @access Private
 * @param {Number} limit - Limit
 * @param {Number} offset - Offset
 *
 * @returns {Object} Blogs
 */
router.get("/", async (req, res) => {
    if (!req.session || !req.session.admin || !req.session.isAdmin) {
        res.redirect("/admin/login");
        return;
    }
    let currentPage = req.query.page ? req.query.page : 1;
    currentPage = parseInt(currentPage);
    let limit = 3;
    let offset = (currentPage - 1) * limit;
    let totalRows = await model.countRows("Blogs");
    totalRows = totalRows['count'];
    let totalPages = parseInt(totalRows / limit) + 1;
    let nextPage = currentPage + 1 < totalPages ? currentPage + 1 : null;
    let prevPage = currentPage > 1 ? currentPage - 1 : null;
    const modelBlogs = await model.getBlogs(limit, offset);
    // check if cookie is set

    res.render("admin/blogs/blogs.handlebars", {
        layout: false,
        header: {
            title: "Blogs",
            keywords: "blogs, admin",
            description: "Admin blogs",
        },
        user: req.session.admin,
        blogs: modelBlogs,
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
            },
        },
    });
});

router.get("/:id", async (req, res) => {
    if (!req.session || !req.session.admin || !req.session.isAdmin) {
        res.redirect("/admin/login");
    }
    const id = req.params.id;
    const result = await model.getBlog(id);
    if (result) {
        res.render("admin/blogs/show_post.handlebars", {
            layout: false,
            header: {
                title: result.blog.title,
                keywords: "blog, admin",
                description: "Admin blog",
            },
            user: req.session.admin,
            blog: result,
            footer: {
                year: new Date().getFullYear(),
                site: {
                    name: "HabibDev.",
                    url: "/",
                },
            },
        });
    }
});

router.get("/delete/:id", async (req, res) => {
    // check if cookie is set
    if (!req.session || !req.session.admin || !req.session.isAdmin) {
        res.redirect("/admin/login");
        return;
    }
    const id = req.params.id;
    await model.deleteBlog(id);
    res.redirect("/admin/blogs");
});

router.get("/edit/:id", async (req, res) => {
    if (!req.session || !req.session.admin || !req.session.isAdmin) {
        res.redirect("/admin/login");
        return;
    }
    const id = req.params.id;
    const result = await model.getBlog(id);
    const error = req.session.errorMessage ? req.session.errorMessage : null;
    delete req.session.errorMessage;

    if (result) {
        res.render("admin/blogs/edit.handlebars", {
            layout: false,
            header: {
                title: "Edit Blog",
                keywords: "edit, blog, admin",
                description: "Edit blog",
            },
            action: "/admin/blogs/edit/" + id,
            user: req.session.admin,
            error: error,
            blog: result,
            submitButtonText: "Update",
            footer: {
                year: new Date().getFullYear(),
                site: {
                    name: "HabibDev.",
                    url: "/",
                },
            },
        });
    } else {
        res.redirect("/admin/blogs");
        return;
    }
});

router.post("/edit/:id", async (req, res) => {
    if (!req.session || !req.session.admin || !req.session.isAdmin) {
        res.redirect("/admin/login");
        return;
    }
    const oldBlog = await model.getBlog(req.params.id);
    const form = new formidable.IncomingForm({
        allowEmptyFiles: true,
        minFileSize: 0,
    });

    if (oldBlog.hasError) {
        req.session.errorMessage = "Blog not found.";
        res.redirect("/admin/blogs/edit/" + id);
        return;
    }

    form.parse(req, async (err, fields, files) => {
        const id = req.params.id;
        if (err) {
            req.session.errorMessage = "Failed to parse form.";
            console.log(err);
            res.redirect("/admin/blogs/edit/" + id);
            return;
        }
        let filePath = oldBlog.blog.main_image;
        if (files.image && files.image[0].size > 0) {
            let uploadedFile = files.image[0];
            let oldpath = uploadedFile.filepath;
            let newpath = path.join(__dirname, "../../public/images/" + uploadedFile.originalFilename);
            filePath = "/images/" + uploadedFile.originalFilename;
            fs.rename(oldpath, newpath, function (err) {
                if (err) {
                    req.session.errorMessage = "Failed to upload image.";
                    res.redirect("/admin/blogs/edit/" + id);
                    return;
                }
            }); // end fs.rename()
        }
        const title = fields.title[0].trim();
        const content = fields.content[0].trim();
        if (title === "" || content === "") {
            req.session.errorMessage = "Title and content are required.";
            res.redirect("/admin/blogs/edit/" + id);
            return;
        }
        const blog = {
            blog_id: id,
            title: title,
            content: content,
            main_image: filePath,
            updated_at: new Date().toISOString(),
        };
        const result = await model.updateBlog(blog);
        if (result) {
            res.redirect("/admin/blogs");
            return;
        } else {
            req.session.errorMessage = "Failed to update the blog. Please try again.";
            res.redirect("/admin/blogs/edit/" + id);
            return;
        }
    });
});


router.post("/new", async (req, res) => {
    if (!req.session || !req.session.admin || !req.session.isAdmin) {
        res.redirect("/admin/login");
    }
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
        if (err) {
            req.session.errorMessage = "Failed to parse form.";
            res.redirect("/admin/blogs/new", {});
            return;
        }

        let uploadedFile = files.image[0];
        let oldpath = uploadedFile.filepath;
        let newpath = path.join(__dirname, "../../public/images/" + uploadedFile.originalFilename);
        let filePath = "/images/" + uploadedFile.originalFilename;

        fs.rename(oldpath, newpath, function (err) {
            if (err) {
                req.session.errorMessage = "Failed to upload image.";
                res.redirect("/admin/blogs/new", {});
                return;
            }
        }) // end fs.rename()

        const title = fields.title[0].trim();
        const content = fields.content[0].trim();
        if (title === "" || content === "") {
            req.session.errorMessage = "Title and content are required.";
            res.redirect("/admin/blogs/new", {});
            return;
        }
        const blog = {
            title: title,
            content: content,
            author: req.session.admin.admin_id,
            main_image: filePath,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }
        const result = await model.addBlog(blog);
        if (result) {
            res.redirect("/admin/blogs");
        } else {
            req.session.errorMessage = "Failed to add the blog. Please try again.";
            res.redirect("/admin/blogs/new", {}) // end res.redirect("admin/blogs/new")
        }
    }); // end form.parse()
});

module.exports = router;