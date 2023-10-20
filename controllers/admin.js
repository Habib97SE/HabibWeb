const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const model = require("../models/admin.js");
const formidable = require("formidable");
const fs = require("fs");
const path = require("path");
const {updateSetting} = require("../models/admin");

router.get("/admin", async (req, res) =>
{
    // check if cookie is set
    if (req.session && req.session.user)
    {
        res.render("admin/index.handlebars", {
            layout: false,
            header: {
                title: "Admin",
                keywords: "admin",
                description: "Admin panel",
            },
            user: req.session.user,
            footer: {
                year: new Date().getFullYear(),
                site: {
                    name: "HabibDev.",
                    url: "/",
                },
            },
        });
    } else
    {
        res.redirect("/admin/login");
    }
});

router.get("/admin/login", async (req, res) =>
{
    // check if cookie is set
    if (req.session && req.session.user && req.cookies.user_sid)
    {
        res.redirect("/admin");
    } else
    {
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

router.post("/admin/login", async (req, res) =>
{
    const {email, password} = req.body;

    // hash password using sha256
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // check if user exists
    const result = await model.getUser(email);

    if (
        result.email_address === email &&
        (await bcrypt.compare(password, result.password))
    )
    {
        // remove password from result
        delete result.password;
        // create session and set cookie
        req.session.user = result;
        res.cookie("user_sid", req.sessionID, {
            expires: new Date(Date.now() + 3600000),
            httpOnly: true,
        });
        res.redirect("/admin");
    } else
    {
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

router.get("/admin/profile", async (req, res) =>
{
    // check if cookie is set
    if (req.session && req.session.user)
    {
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
    } else
    {
        res.redirect("/admin/login");
    }
});

router.post("/admin/profile", async (req, res) =>
{
    // if user is not logged in, redirect to login page
    if (!req.session || !req.session.user)
    {
        res.redirect("/admin/login");
    }

    // if password field is empty, redirect to profile page
    if (req.body.password === "")
    {
        res.redirect("/admin/profile");
    }

    const {firstName, lastName, emailAddress, password} = req.body;

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

    if (result)
    {
        // update session
        req.session.user.first_name = firstName;
        req.session.user.last_name = lastName;
        req.session.user.email_address = emailAddress;
        res.redirect("/admin/profile");
    } else
    {
        res.redirect("/admin/profile");
    }
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
router.get("/admin/blogs", async (req, res) =>
{
    let page = req.query.page ? req.query.page : 1;
    let limit = 3;
    let offset = (page - 1) * limit;
    let posts = await model.getBlogs(limit, offset);
    let totalPosts = await model.countRows("Blogs");
    totalPosts = totalPosts.length;
    let totalPages = totalPosts / limit;
    // check if cookie is set
    if (req.session && req.session.user)
    {
        res.render("admin/blogs.handlebars", {
            layout: false,
            header: {
                title: "Blogs",
                keywords: "blogs, admin",
                description: "Admin blogs",
            },
            user: req.session.user,
            blogs: await model.getBlogs(limit, offset),
            hasMultiplePages: totalPages > 1,
            prev: parseInt(page) - 1 > 0 ? parseInt(page) - 1 : 1,
            next: parseInt(page) + 1 <= totalPages ? parseInt(page) + 1 : totalPages,
            currentPage: page,
            totalPages: totalPages,
            footer: {
                year: new Date().getFullYear(),
                site: {
                    name: "HabibDev.",
                    url: "/",
                },
            },
        });
    } else
    {
        res.redirect("/admin/login");
    }
});

router.get("/admin/blogs/:id", async (req, res) =>
{
    if (!req.session && !req.session.user)
    {
        res.redirect("/admin/login");
    }
    const id = req.params.id;
    const result = await model.getBlog(id);
    if (result)
    {
        res.render("admin/show_post.handlebars", {
            layout: false,
            header: {
                title: result.title,
                keywords: "blog, admin",
                description: "Admin blog",
            },
            user: req.session.user,
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

router.get("/admin/blogs/delete/:id", async (req, res) =>
{
    // check if cookie is set
    if (req.session && req.session.user)
    {
        const id = req.params.id;
        const result = await model.deleteBlog(id);
        if (result)
        {
            res.redirect("/admin/blogs");
        } else
        {
            res.redirect("/admin/blogs");
        }
    } else
    {
        res.redirect("/admin/login");
    }
});

router.get("/admin/blogs/edit/:id", async (req, res) =>
{
    // check if cookie is set
    if (req.session && req.session.user)
    {
        const id = req.params.id;
        const result = await model.getBlog(id);
        if (result)
        {
            res.render("admin/post.handlebars", {
                layout: false,
                header: {
                    title: "Edit Blog",
                    keywords: "edit, blog, admin",
                    description: "Edit blog",
                },
                action: "/admin/blogs/edit/" + id,
                user: req.session.user,
                blog: {
                    title: result.title,
                    content: result.content,
                },
                submitButtonText: "Update",
                footer: {
                    year: new Date().getFullYear(),
                    site: {
                        name: "HabibDev.",
                        url: "/",
                    },
                },
            });
        } else
        {
            res.redirect("/admin/blogs");
        }
    } else
    {
        // if user session is not set, redirect to login page
        res.redirect("/admin/login");
    }
});

router.post("/admin/blogs/edit/:id", async (req, res) =>
{
    if (!req.session && !req.session.user)
    {
        res.redirect("/admin/login");
    }
    let image_path = "";
    let form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) =>
    {
        if (err)
        {
            res.redirect("/admin/blogs/edit/" + id, {
                layout: false,
                header: {
                    title: "Edit Blog",
                    keywords: "edit, blog, admin",
                    description: "Edit blog",
                },
                action: "/admin/blogs/edit/" + id,
                user: req.session.user,
                blog: {
                    title: fields.title[0],
                    content: fields.content[0],
                },
                erros: ["Failed to upload image."],
                submitButtonText: "Update",
                footer: {
                    year: new Date().getFullYear(),
                    site: {
                        name: "HabibDev.",
                        url: "/",
                    },
                },
            });
            return;
        }

        let uploadedFile = files.image[0];
        let oldpath = uploadedFile.filepath;
        let newpath = path.join(__dirname, "../public/images/" + uploadedFile.originalFilename);
        let filePath = "/images/" + uploadedFile.originalFilename;


        fs.rename(oldpath, newpath, function (err)
        {
            if (err)
            {
                res.redirect("/admin/blogs/edit/" + id, {
                    layout: false,
                    header: {
                        title: "Edit Blog",
                        keywords: "edit, blog, admin",
                        description: "Edit blog",
                    },
                    action: "/admin/blogs/edit/" + id,
                    user: req.session.user,
                    blog: {
                        title: fields.title[0],
                        content: fields.content[0],
                    },
                    erros: ["Failed to upload image."],
                    submitButtonText: "Update",
                    footer: {
                        year: new Date().getFullYear(),
                        site: {
                            name: "HabibDev.",
                            url: "/",
                        },
                    },
                });
                return;
            }

            image_path = newpath;
        });
        const id = req.params.id;
        const title = fields.title[0];
        const content = fields.content[0];

        if (title === "" || content === "")
        {
            res.redirect("/admin/blogs/edit/" + id);
            return;
        }
        const blog = {
            blog_id: id,
            title: title.trim(),
            content: content.trim(),
            author: req.session.user.admin_id,
            main_image: filePath,
            updated_at: new Date().toISOString(),
        };
        const result = await model.updateBlog(blog);
        if (result)
        {
            res.redirect("/admin/blogs");
        } else
        {
            res.redirect("/admin/blogs/edit/" + id, {
                layout: false,
                header: {
                    title: "Edit Blog",
                    keywords: "edit, blog, admin",
                    description: "Edit blog",
                },
                action: "/admin/blogs/edit/" + id,
                user: req.session.user,
                blog: {
                    title: fields.title[0],
                    content: fields.content[0],
                },
                erros: ["Something went wrong. Please try again."],
                submitButtonText: "Update",
                footer: {
                    year: new Date().getFullYear(),
                    site: {
                        name: "HabibDev.",
                        url: "/",
                    },
                },
            });
        }

    }); // end form.parse()
});
router.get("/admin/blogs/new", async (req, res) =>
{
    // check if cookie is set
    if (req.session && req.session.user)
    {
        res.render("admin/post.handlebars", {
            layout: false,
            header: {
                title: "Add Blog",
                keywords: "add, blog, admin",
                description: "Add blog",
            },
            action: "/admin/blog/new",
            submitButtonText: "Add New Blog",
            user: req.session.user,
            footer: {
                year: new Date().getFullYear(),
                site: {
                    name: "HabibDev.",
                    url: "/",
                },
            },
        });
    } else
    {
        res.redirect("/admin/login");
    }
});

router.post("/admin/blog/new", async (req, res) =>
{
    if (!req.session && !req.session.user)
    {
        res.redirect("/admin/login");
    }
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) =>
    {
        if (err)
        {
            res.redirect("/admin/blogs/new", {
                layout: false,
                header: {
                    title: "Add Blog",
                    keywords: "add, blog, admin",
                    description: "Add blog",
                },
                action: "/admin/blog/new",
                submitButtonText: "Add New Blog",
                user: req.session.user,
                errors: ["Failed to upload image."],
                footer: {
                    year: new Date().getFullYear(),
                    site: {
                        name: "HabibDev.",
                        url: "/",
                    },
                },
            });
            return;
        }

        let uploadedFile = files.image[0];
        let oldpath = uploadedFile.filepath;
        let newpath = path.join(__dirname, "../public/images/" + uploadedFile.originalFilename);
        let filePath = "/images/" + uploadedFile.originalFilename;

        fs.rename(oldpath, newpath, function (err)
        {
            if (err)
            {
                res.redirect("/admin/blogs/new", {
                    layout: false,
                    header: {
                        title: "Add Blog",
                        keywords: "add, blog, admin",
                        description: "Add blog",
                    },
                    action: "/admin/blog/new",
                    submitButtonText: "Add New Blog",
                    user: req.session.user,
                    errors: ["Failed to upload image."],
                    footer: {
                        year: new Date().getFullYear(),
                        site: {
                            name: "HabibDev.",
                            url: "/",
                        },
                    },
                });
                return;
            }
        }) // end fs.rename()

        const title = fields.title[0].trim();
        const content = fields.content[0].trim();
        if (title === "" || content === "")
        {
            res.redirect("/admin/blogs/new", {
                layout: false,
                header: {
                    title: "Add Blog",
                    keywords: "add, blog, admin",
                    description: "Add blog",
                },
                action: "/admin/blog/new",
                submitButtonText: "Add New Blog",
                user: req.session.user,
                errors: ["Title and content are required."],
                footer: {
                    year: new Date().getFullYear(),
                    site: {
                        name: "HabibDev.",
                        url: "/",
                    }
                }
            });
            return;
        }
        const blog = {
            title: title,
            content: content,
            author: req.session.user.admin_id,
            main_image: filePath,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }
        const result = await model.addBlog(blog);
        if (result)
        {
            res.redirect("/admin/blogs");
        } else
        {
            res.redirect("/admin/blogs/new", {
                layout: false,
                header: {
                    title: "Add Blog",
                    keywords: "add, blog, admin",
                    description: "Add blog",
                },
                action: "/admin/blog/new",
                submitButtonText: "Add New Blog",
                user: req.session.user,
                errors: ["Title and content are required."],
                footer: {
                    year: new Date().getFullYear(),
                    site: {
                        name: "HabibDev.",
                        url: "/",
                    }
                }

            }) // end res.redirect("admin/blogs/new")
        }
    }); // end form.parse()
});

// handle guest blog posts,
// Base path: /admin/guest-blogs
router.get("/admin/guest-blogs", async (req, res) =>
{
    if (!req.session && !req.session.user)
    {
        res.redirect("/admin/login");
    }
    let limit = 3;
    let offset = 0;
    let totalRows = await model.countRows("Guest_Posts");
    let totalPages = parseInt(totalRows / limit) + 1;
    res.render("admin/guest_blogs.handlebars", {
        layout: false,
        header: {
            title: "Guest Blogs",
            keywords: "guest, blogs, admin",
            description: "Guest blogs",
        },
        user: req.session.user,
        blogs: await model.getGuestBlogs(limit, offset),
        hasMultiplePages: true,
        prev: 1,
        next: 2,
        currentPage: 1,
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

router.get("/admin/guest-blogs/page/:page", async (req, res) =>
{
    if (!req.session && !req.session.user)
    {
        res.redirect("/admin/login");
    }
    let limit = 3;
    let offset = (req.params.page - 1) * limit;
    let totalRows = await model.countRows("Guest_Posts");
    let totalPages = parseInt(totalRows / limit) + 1;
    res.render("admin/guest_blogs.handlebars", {
        layout: false,
        header: {
            title: "Guest Blogs",
            keywords: "guest, blogs, admin",
            description: "Guest blogs",
        },
        user: req.session.user,
        blogs: await model.getGuestBlogs(limit, offset),
        hasMultiplePages: true,
        prev: req.params.page - 1,
        next: parseInt(req.params.page) + 1,
        currentPage: req.params.page,
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

router.get("/admin/guest-blogs/:id", async (req, res) =>
{
    if (!req.session && !req.session.user)
    {
        res.redirect("/admin/login");
    }
    const id = req.params.id;
    const result = await model.getGuestBlog(id);
    if (result)
    {
        res.render("admin/show_post.handlebars", {
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

router.get("/admin/guest-blogs/delete/:id", async (req, res) =>
{
    if (!req.session && !req.session.user)
    {
        res.redirect("/admin/login");
    }
    const id = req.params.id;
    const result = await model.deleteGuestBlog(id);
    if (result)
    {
        res.redirect("/admin/guest-blogs");
    } else
    {
        res.redirect("/admin/guest-blogs");
    }
});

router.get("/admin/guest-blogs/edit/:id", async (req, res) =>
{
    if (!req.session && !req.session.user)
    {
        res.redirect("/admin/login");
    }
    const id = req.params.id;
    const result = await model.getGuestBlog(id);
    if (result)
    {
        res.render("admin/post.handlebars", {
            layout: false,
            header: {
                title: "Edit Guest Blog",
                keywords: "edit, guest, blog, admin",
                description: "Edit guest blog",
            },
            action: "/admin/guest-blogs/edit/" + id,
            user: req.session.user,
            blog: result,
            submitButtonText: "Update",
            footer: {
                year: new Date().getFullYear(),
                site: {
                    name: "HabibDev.",
                    url: "/",
                }
            }
        }); // end res.render()
    } else
    {
        res.redirect("/admin/guest-blogs");
    }
}); // end router.get()

router.post("/admin/guest-blogs/edit/:id", async (req, res) =>
{
    if (!req.session && !req.session.user)
    {
        res.redirect("/admin/login");
    }
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) =>
    {
        const id = req.params.id;
        if (err)
        {
            redirect("/admin/guest-blogs/edit/" + id);
        }
        let uploadedFile = files.image[0];
        let oldpath = uploadedFile.filepath;
        let newpath = path.join(__dirname, "../public/images/" + uploadedFile.originalFilename);
        let filePath = "/images/" + uploadedFile.originalFilename;
        fs.rename(oldpath, newpath, function (err)
        {
            if (err)
            {
                res.redirect("/admin/guest-blogs/edit/" + id);
                return;
            }
        }); // end fs.rename()
        const title = fields.title[0].trim();
        const content = fields.content[0].trim();
        if (title === "" || content === "")
        {
            res.redirect("/admin/guest-blogs/edit/" + id);
            return;
        }
        const blog = {
            guest_post_id: id,
            title: title,
            content: content,
            main_image: filePath
        }
        const result = await model.updateGuestBlog(blog);
    }); // end form.parse()
});

router.get("/admin/guest-blogs/new", async (req, res) =>
{
    if (!req.session && !req.session.user)
    {
        res.redirect("/admin/login");
    }
    res.render("admin/post.handlebars", {
        layout: false,
        header: {
            title: "Add Guest Blog",
            keywords: "add, guest, blog, admin",
            description: "Add guest blog",
        },
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

router.post("/admin/guest-blogs/new", async (req, res) =>
{
    if (!req.session && !req.session.user)
    {
        res.redirect("/admin/login");
    }
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) =>
    {
        if (err)
        {
            res.redirect("/admin/guest-blogs/new", {
                layout: false,
                header: {
                    title: "Add Guest Blog",
                    keywords: "add, guest, blog, admin",
                    description: "Add guest blog",
                },
                action: "/admin/guest-blogs/new",
                submitButtonText: "Add New Guest Blog",
                user: req.session.user,
                errors: ["Something went wrong, try again"],
                footer: {
                    year: new Date().getFullYear(),
                    site: {
                        name: "HabibDev.",
                        url: "/",
                    }
                }
            });
            return;
        }
        let uploadedFile = files.image[0];
        let oldpath = uploadedFile.filepath;
        let newpath = path.join(__dirname, "../public/images/" + uploadedFile.originalFilename);
        let filePath = "/images/" + uploadedFile.originalFilename;
        fs.rename(oldpath, newpath, function (err)
        {
            if (err)
            {
                res.redirect("/admin/guest-blogs/new");
                return;
            }
        }); // end fs.rename()
        const title = fields.title[0].trim();
        const content = fields.content[0].trim();
        const firstName = fields.first_name[0].trim();
        const lastName = fields.last_name[0].trim();
        const emailAddress = fields.email[0].trim();
        if (title === "" || content === "" || firstName === "" || lastName === "" || emailAddress === "")
        {
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
        if (result)
        {
            res.redirect("/admin/guest-blogs");
        } else
        {
            res.redirect("/admin/guest-blogs/new", {
                layout: false,
                header: {
                    title: "Add Guest Blog",
                    keywords: "add, guest, blog, admin",
                    description: "Add guest blog",
                },
                action: "/admin/guest-blogs/new",
                submitButtonText: "Add New Guest Blog",
                user: req.session.user,
                errors: ["Submission was not successful. Please try again. Double check your inputs."],
                footer: {
                    year: new Date().getFullYear(),
                    site: {
                        name: "HabibDev.",
                        url: "/",
                    }
                }
            });
        }
    }); // end form.parse()
}); // end router.post()

router.get("/admin/projects/new", async (req, res) =>
{
    

    if (!req.session || !req.session.user)
    {
        return res.redirect("/admin/login");
    } 
    const error = req.session.errorMessage ? req.session.errorMessage : null;
    delete req.session.errorMessage;
    res.render("admin/new_project.handlebars", {
        header : {
            title : "New Project",
            keywords : "new, project, admin",
            description : "New project",
        },
        layout : false,
        action : "/admin/projects/new",
        error : error,
        submitButtonText : "Add New Project",
        user : req.session.user,
        footer : {
            year : new Date().getFullYear(),
            site : {
                name : "HabibDev.",
                url : "/",
            }
        }
    });
});

router.get("/admin/projects", async (req, res) => {
    if (!req.session || !req.session.user) {
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


    res.render("admin/projects.handlebars", {
        layout: false,
        header: {
            title: "Projects",
            keywords: "projects, admin",
            description: "Projects",
        },
        user: req.session.user,
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



router.get("/admin/projects/:id", async (req, res) =>
{
    if (!req.session || !req.session.user)
    {
        res.redirect("/admin/login");
    }
    const id = req.params.id;
    const result = await model.getProject(id);
    if (result)
    {
        res.render("admin/show_project.handlebars", {
            layout: false,
            header: {
                title: result.title,
                keywords: "project, admin",
                description: "Project",
            },
            user: req.session.user,
            model: result,
            footer: {
                year: new Date().getFullYear(),
                site: {
                    name: "HabibDev.",
                    url: "/",
                }
            }
        }); // end res.render()
    } else
    {
        res.redirect("/admin/projects");
    }
}); // end router.get()

router.get("/admin/projects/delete/:id", async (req, res) =>
{
    if (!req.session || !req.session.user)
    {
        res.redirect("/admin/login");
    }
    const id = req.params.id;
    const result = await model.deleteProject(id);
    if (result)
    {
        res.redirect("/admin/projects");
    } else
    {
        res.redirect("/admin/projects");
    }
}); // end router.get()

router.get("/admin/projects/edit/:id", async (req, res) =>
{
    if (!req.session || !req.session.user)
    {
        res.redirect("/admin/login");
        return;
    }
    const id = req.params.id;
    const result = await model.getProject(id);
    const error = req.session.errorMessage ? req.session.errorMessage : null;
    delete req.session.errorMessage;
    console.dir(result);
    if (result)
    {
        res.render("admin/edit_project.handlebars", {
            layout: false,
            header: {
                title: "Edit the project: " + result.title,
                keywords: "edit, project, admin",
                description: "Edit project",
            },
            action: "/admin/projects/edit/" + id,
            user: req.session.user,
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
    } else
    {
        res.redirect("/admin/projects");
        return;
    }
}); // end router.get()

router.post("/admin/projects/edit/:id", async (req, res) =>
{
    
    if (!req.session || !req.session.user)
    {
        res.redirect("/admin/login");
        return;
    }
    const project = await model.getProject(req.params.id);
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) =>
    {
        const id = req.params.id;
        if (err)
        {
             redirect("/admin/projects/edit/" + id);
             return;
        }
         // check if user has chosen an image to upload 
         let filePath = project.main_image;
        if (files.image && files.image[0].size > 0)
        {
            let uploadedFile = files.image[0];
            let oldpath = uploadedFile.filepath;
            let newpath = path.join(__dirname, "../public/images/" + uploadedFile.originalFilename);
            filePath =  "/images/" + uploadedFile.originalFilename; 
            fs.rename(oldpath, newpath, function (err)
            {
                if (err)
                {
                    req.session.errorMessage = "Failed to upload image.";
                    res.redirect("/admin/projects/edit/" + id);
                    return;
                }
            }); // end fs.rename() 
        }
        

        
        const title = fields.title[0].trim();
        const content = fields.content[0].trim();
        
        if (title === "" || content === "")
        {
            req.session.errorMessage = "Title and content are required.";
            res.redirect("/admin/projects/edit/" + id, {});
            return;
        }
        const editedProject = {
            project_id: id,
            title: title,
            content: content,
            main_image: filePath,
            updated_at: new Date().toISOString()
        }
        const result = await model.updateProject(project);
        // if project updated successfully
        if (result)
        {
            res.redirect("/admin/projects");
        } else
        {
            req.session.errorMessage = "Something went wrong. Please try again.";
            res.redirect("/admin/projects/edit/" + id, {});
            return;
        }
    }); // end form.parse()
}); // end router.post()



router.post("/admin/projects/new", async (req, res) =>
{
    if (!req.session || !req.session.user)
    {
        res.redirect("/admin/login");
        return;
    }
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) =>
    {
        if (err)
        {
            res.redirect("/admin/projects/new");
        }
        let uploadedFile = files.image[0];
        let oldpath = uploadedFile.filepath;
        let newpath = path.join(__dirname, "../public/images/" + uploadedFile.originalFilename);
        let filePath = "/images/" + uploadedFile.originalFilename;
        fs.rename(oldpath, newpath, function (err)
        {
            if (err)
            {
                req.session.errorMessage = "Failed to upload image.";
                res.redirect("/admin/projects/new", {});
                return;
            }
        }); // end fs.rename()
        const title = fields.title[0].trim();
        const content = fields.content[0].trim();
        if (title === "" || content === "")
        {
            req.session.errorMessage = "Title and content are required.";
            res.redirect("/admin/projects/new", {}); // end res.redirect()
            return;
        }
        const project = {
            title: title,
            content: content,
            main_image: filePath,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
        const result = await model.addProject(project);
        if (result)
        {
            res.redirect("/admin/projects");
            return;
        } else
        {
            req.session.errorMessage = "Something went wrong. Please try again.";
            res.redirect("/admin/projects/new", {});
            return;
        }
    }); // end form.parse()
}); // end router.post()

router.get("/admin/settings", async (req, res) =>
{
    if (!req.session && !req.session.user)
    {
        res.redirect("/admin/login");
    }
    const settings = await model.getSettings();

    res.render("admin/settings.handlebars", {
        layout: false,
        header: {
            title: "Settings",
            keywords: "settings, admin",
            description: "Settings",
        },
        settings: settings,
        user: req.session.user,
        error: req.query.error,
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

router.post("/admin/settings", async (req, res) =>
{
    if (!req.session && !req.session.user)
    {
        res.redirect("/admin/login");
    }

    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) =>
    {
        let numberOfFields = Object.keys(fields).length;
        let settings = {};
        for (let i = 0; i < numberOfFields; i++)
        {
            if (Object.values(fields)[i] === "")
            {
                res.redirect("/admin/settings?empty=true");
            }
            settings = Object.entries(fields).map(([key, value]) => ({ [key]: value }));
        }
        let result = true;
        settings.forEach(async (obj) => {
            const key = Object.keys(obj)[0];
            const value = obj[key];
            try {
                await updateSetting(key, value[0]);
            } catch (error) {
                result = false;
                console.error(`Failed to insert setting: ${key}. Error: ${error.message}`);
            }
        });
        if (result)
        {
            res.redirect("/admin/settings?success=true");
        } else
        {
            res.redirect("/admin/settings?error=true");
        }
    }) // end form.parse()

});

router.get("/admin/settings/new", async (req, res) =>
{
    if (!req.session && !req.session.user)
    {
        res.redirect("/admin/login");
    }
    res.render("admin/new_settings.handlebars", {
        layout: false,
        header: {
            title: "Settings",
            keywords: "settings, admin",
            description: "Settings",
        },
        settings: {},
        user: req.session.user,
        footer: {
            year: new Date().getFullYear(),
            site: {
                name: "HabibDev.",
                url: "/",
            }
        }
    });
}); // end router.get()

router.post("/admin/settings/new", async (req, res) =>
{
    if (!req.session && !req.session.user)
    {
        res.redirect("/admin/login");
    }
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) =>
    {
        if (err)
        {
            console.error("Error parsing the form:", err);
            return;
        }

        // check if setting_name and setting_value are not empty
        if (fields.setting_name[0].trim() === "" || fields.setting_value[0].trim() === "")
        {
            res.redirect("/admin/settings/new", {
                layout: false,
                header: {
                    title: "Add new settings",
                    keywords: "settings, admin",
                    description: "Settings",
                },
                user: req.session.user,
                errors: ["Setting name and value are required."],
                footer: {
                    year: new Date().getFullYear(),
                    site: {
                        name: "HabibDev.",
                        url: "/",
                    }
                }
            }) // end res.redirect()
        }

        let setting = {};

        setting["setting_name"] = fields.setting_name[0];
        setting["setting_value"] = fields.setting_value[0];

        const result = await model.addSetting(setting);
        if (result)
        {
            res.redirect("/admin/settings");
        } else
        {
            res.redirect("/admin/settings/new", {
                layout: false,
                header: {
                    title: "Settings",
                    keywords: "settings, admin",
                    description: "Settings",
                },
                settings: settings,
                user: req.session.user,
                errors: ["Something went wrong, try again."],
                footer: {
                    year: new Date().getFullYear(),
                    site: {
                        name: "HabibDev.",
                        url: "/",
                    },
                },
            });
        }
    }) // end form.parse()
});


router.get("/admin/logout", async (req, res) => {
    if (!req.session || !req.session.user) 
    {
        return res.redirect("/admin/login");
    } 
    req.session.destroy();
    res.redirect("/admin/login");
});

module.exports = router;
