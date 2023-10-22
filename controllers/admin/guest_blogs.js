const express = require("express");
const router = express.Router();
const model = require("../../models/admin/guest_blogs.js");
const formidable = require("formidable");


router.get("/admin/guest-blogs/new", async (req, res) => {
    if (!req.session || !req.session.user) {
        res.redirect("/admin/login");
        return;
    }

    const error = req.session.errorMessage ? req.session.errorMessage : null;
    delete req.session.errorMessage;
    res.render("admin/guest_blogs/add_blog.handlebars", {
        layout: false,
        header: {
            title: "Add Guest Blog",
            keywords: "add, guest, blog, admin",
            description: "Add guest blog",
        },
        error: error,
        action: "/admin/guest-blogs/new",
        submitButtonText: "Add New Guest Blog",
        user: req.session.user,
        footer: {
            year: new Date().getFullYear(),
            site: {
                name: "HabibDev.",
                url: "/",
            }
        }
    }); // end res.render()
}); // end router.get()

// handle guest blog posts,
// Base path: /admin/guest-blogs
router.get("/admin/guest-blogs", async (req, res) => {
    if (!req.session || !req.session.user) {
        res.redirect("/admin/login");
        return;
    }
    let currentPage = req.query.page ? req.query.page : 1;
    let limit = 3;
    let offset = (currentPage - 1) * limit;
    let totalRows = await model.countRows("Guest_Posts");
    totalRows = totalRows['count'];
    let totalPages = parseInt(totalRows / limit) + 1;

    let nextPage = currentPage < totalPages ? currentPage + 1 : null;
    let prevPage = currentPage > 1 ? currentPage - 1 : null;

    let modelGuestPosts = await model.getGuestBlogs(limit, offset);


    res.render("admin/guest_blogs/blogs.handlebars", {
        layout: false,
        header: {
            title: "Guest Blogs",
            keywords: "guest, blogs, admin",
            description: "Guest blogs",
        },
        user: req.session.user,
        model: modelGuestPosts,
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
});



router.get("/admin/guest-blogs/:id", async (req, res) => {
    if (!req.session || !req.session.user) {
        res.redirect("/admin/login");
        return;
    }
    const id = req.params.id;
    const result = await model.getGuestBlog(id);
    if (result) {
        res.render("admin/guest_blogs/show_blog.handlebars", {
            layout: false,
            header: {
                title: result.title,
                keywords: "guest, blog, admin",
                description: "Guest blog",
            },
            user: req.session.user,
            blog: result,
            footer: {
                year: new Date().getFullYear(),
                site: {
                    name: "HabibDev.",
                    url: "/",
                }
            }
        }); // end res.render()
    }
});

router.get("/admin/guest-blogs/delete/:id", async (req, res) => {
    if (!req.session || !req.session.user) {
        res.redirect("/admin/login");
        return;
    }
    const id = req.params.id;
    const result = await model.deleteGuestBlog(id);
    if (result) {
        res.redirect("/admin/guest-blogs");
        return;
    } else {
        res.redirect("/admin/guest-blogs");
        return;
    }
});

router.get("/admin/guest-blogs/edit/:id", async (req, res) => {
    if (!req.session || !req.session.user) {
        res.redirect("/admin/login");
        return;
    }
    const id = req.params.id;
    const result = await model.getGuestBlog(id);
    const error = req.session.errorMessage ? req.session.errorMessage : null;
    delete req.session.errorMessage;
    if (result) {
        res.render("admin/guest_blogs/edit.handlebars", {
            layout: false,
            header: {
                title: "Edit Guest Blog",
                keywords: "edit, guest, blog, admin",
                description: "Edit guest blog",
            },
            action: "/admin/guest-blogs/edit/" + id,
            user: req.session.user,
            error: error,
            model: result,
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
        res.redirect("/admin/guest-blogs");
        return;
    }
}); // end router.get()

router.post("/admin/guest-blogs/edit/:id", async (req, res) => {
    // Check if user is logged in
    if (!req.session || !req.session.user) {
        res.redirect("/admin/login");
        return;
    }

    // Fetch the existing post details
    const guest_post = await model.getGuestBlog(req.params.id); // Assuming this is async
    if (!guest_post) {
        req.session.errorMessage = "Post not found.";
        res.redirect("/admin/guest-blogs");
        return;
    }

    // Setup Formidable
    let form = new formidable.IncomingForm();
    form.allowEmptyFiles = true; // Allowing empty files

    // Parse the form
    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error(err);
            req.session.errorMessage = "Something went wrong during form parsing. Please try again.";
            res.redirect("/admin/guest-blogs/edit/" + req.params.id);
            return;
        }

        // Initialize filePath with the existing image path
        let filePath = guest_post.guest_post.main_image;

        // Check if a new image file is uploaded
        if (files.image && files.image.size > 0) {
            let uploadedFile = files.image;
            let oldpath = uploadedFile.filepath;
            let newpath = path.join(__dirname, "../public/images/" + uploadedFile.name); // using 'name' instead of 'originalFilename'
            filePath = "/images/" + uploadedFile.name;

            // Try renaming (moving) the file
            try {
                fs.renameSync(oldpath, newpath);
            } catch (err) {
                console.error(err);
                req.session.errorMessage = "Failed to upload image.";
                res.redirect("/admin/guest-blogs/edit/" + req.params.id);
                return;
            }
        }

        // Validate form fields
        const title = fields.title?.trim(); // Optional chaining in case 'title' is undefined
        const content = fields.content?.trim(); // Optional chaining in case 'content' is undefined

        // Check required fields
        if (!title || !content) {
            req.session.errorMessage = "Title and content are required.";
            res.redirect("/admin/guest-blogs/edit/" + req.params.id);
            return;
        }

        // Prepare the blog data
        const blog = {
            guest_post_id: req.params.id,
            title: title,
            content: content,
            main_image: filePath // this will be the old image path if no new image was uploaded
        };

        // Try updating the post
        try {
            const result = await model.updateGuestBlog(blog);
            if (result) {
                // Redirect if successful
                res.redirect("/admin/guest-blogs");
            } else {
                req.session.errorMessage = "Failed to update the post. Please try again.";
                res.redirect("/admin/guest-blogs/edit/" + req.params.id);
                return;
            }
        } catch (error) {
            console.error(error);
            req.session.errorMessage = "Something went wrong during post update. Please try again.";
            res.redirect("/admin/guest-blogs/edit/" + req.params.id);
            return;
        }
    });
});



router.post("/admin/guest-blogs/new", async (req, res) => {
    if (!req.session || !req.session.user) {
        res.redirect("/admin/login");
        return;
    }
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
        if (err) {
            req.session.errorMessage = "Something went wrong during form parsing. Please try again.";
            res.redirect("/admin/guest-blogs/new", {});
            return;
        }
        let uploadedFile = files.image[0];
        let oldpath = uploadedFile.filepath;
        let newpath = path.join(__dirname, "../public/images/" + uploadedFile.originalFilename);
        let filePath = "/images/" + uploadedFile.originalFilename;
        fs.rename(oldpath, newpath, function (err) {
            if (err) {
                req.session.errorMessage = "Failed to upload image.";
                res.redirect("/admin/guest-blogs/new");
                return;
            }
        }); // end fs.rename()
        const title = fields.title[0].trim();
        const content = fields.content[0].trim();
        const firstName = fields.author_first_name[0].trim();
        const lastName = fields.author_last_name[0].trim();
        const emailAddress = fields.author_email[0].trim();
        if (title === "" || content === "" || firstName === "" || lastName === "" || emailAddress === "") {
            req.session.errorMessage = "All fields are required.";
            res.redirect("/admin/guest-blogs/new");
            return;
        }
        const blog = {
            title: title,
            content: content,
            main_image: filePath,
            author_first_name: firstName,
            author_last_name: lastName,
            author_email: emailAddress,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
        const result = await model.addGuestBlog(blog);
        if (result) {
            res.redirect("/admin/guest-blogs");
            return;
        } else {
            req.session.errorMessage = "Failed to add the guest blog. Please try again.";
            res.redirect("/admin/guest-blogs/new", {});
            return;
        }
    }); // end form.parse()
}); // end router.post()

module.exports = router;