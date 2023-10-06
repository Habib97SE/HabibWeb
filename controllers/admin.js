const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const model = require("../models/admin.js");

router.get("/admin", async (req, res) => {
  // check if cookie is set
  if (req.session && req.session.user) {
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

router.get("/admin/profile", async (req, res) => {
  // check if cookie is set
  if (req.session && req.session.user) {
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
  } else {
    res.redirect("/admin/login");
  }
});

router.post("/admin/profile", async (req, res) => {
  // if user is not logged in, redirect to login page
  if (!req.session || !req.session.user) {
    res.redirect("/admin/login");
  }

  // if password field is empty, redirect to profile page
  if (req.body.password === "") {
    res.redirect("/admin/profile");
  }

  const { firstName, lastName, emailAddress, password } = req.body;

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
  console.dir(updated_user);
  // update user
  const result = await model.updateUser(updated_user);

  if (result) {
    // update session
    req.session.user.first_name = firstName;
    req.session.user.last_name = lastName;
    req.session.user.email_address = emailAddress;
    res.redirect("/admin/profile");
  } else {
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
router.get("/admin/blogs", async (req, res) => {
  let limit = 9;
  let offset = 0;
  // check if cookie is set
  if (req.session && req.session.user) {
    res.render("admin/blogs.handlebars", {
      layout: false,
      header: {
        title: "Blogs",
        keywords: "blogs, admin",
        description: "Admin blogs",
      },
      user: req.session.user,
      blogs: await model.getBlogs(limit, offset),
      hasMultiplePages: true,
      prev: 1,
      next: 3,
      currentPage: 2,
      totalPages: 5,
      footer: {
        year: new Date().getFullYear(),
        site: {
          name: "HabibDev.",
          url: "/",
        },
      },
    });
  } else {
    res.redirect("/admin/login");
  }
});

router.get("/admin/blogs/delete/:id", async (req, res) => {
  // check if cookie is set
  if (req.session && req.session.user) {
    const id = req.params.id;
    const result = await model.deleteBlog(id);
    if (result) {
      res.redirect("/admin/blogs");
    } else {
      res.redirect("/admin/blogs");
    }
  } else {
    res.redirect("/admin/login");
  }
});

router.get("/admin/blogs/edit/:id", async (req, res) => {
  // check if cookie is set
  if (req.session && req.session.user) {
    const id = req.params.id;
    const result = await model.getBlog(id);
    if (result) {
      res.render("admin/edit_blog.handlebars", {
        layout: false,
        header: {
          title: "Edit Blog",
          keywords: "edit, blog, admin",
          description: "Edit blog",
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
    } else {
      res.redirect("/admin/blogs");
    }
  } else {
    res.redirect("/admin/login");
  }
});

router.post("/admin/blogs/edit/:id", async (req, res) => {
  // check if cookie is set
  if (req.session && req.session.user) {
    const id = req.params.id;
    const { title, content } = req.body;
    const blog = {
      title: title,
      content: content,
      updated_at: new Date().toISOString(),
    };
    const result = await model.updateBlog(id, blog);
    if (result) {
      res.redirect("/admin/blogs");
    } else {
      res.redirect("/admin/blogs/edit/" + id);
    }
  } else {
    res.redirect("/admin/login");
  }
});

router.get("/admin/blogs/new", async (req, res) => {
  // check if cookie is set
  if (req.session && req.session.user) {
    res.render("admin/new_post.handlebars", {
      layout: false,
      header: {
        title: "Add Blog",
        keywords: "add, blog, admin",
        description: "Add blog",
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
  } else {
    res.redirect("/admin/login");
  }
});

router.post("/admin/blog/add", async (req, res) => {
  // check if cookie is set
  if (req.session && req.session.user) {
    const { title, content, main_image } = req.body;
    const blog = {
      author_id = req.session.user.admin_id,
      title: title,
      content: content,
      main_image: main_image,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const result = await model.addBlog(blog);
    if (result) {
      res.redirect("/admin/blogs");
    } else {
      res.redirect("/admin/blogs/new");
    }
  } else {
    res.redirect("/admin/login");
  }
});

module.exports = router;
