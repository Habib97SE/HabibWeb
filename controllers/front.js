const express = require("express");
const model = require("../models/front.js");
const { parse } = require("handlebars");

// get nav items from model and pass them to the view

const router = express.Router();

/**
 * @description Home page
 * @method GET /
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {String} - HTML page
 * @throws {Error} - throws error if there is an error
 */
router.get("/", async (req, res) => {
  let linkedinLink = await model.getLinkedinLink();
  let githubLink = await model.getGithubLink();
  let phoneNumber = await model.getPhoneNumber();
  let emailAddress = await model.getEmailAddress();
  let blogPosts = await model.getBlogPosts(3, 0);
  let projects = await model.getProjects(3, 0);
  let guestPosts = await model.getGuestPosts(3, 0);
  let address = await model.getAddress();
  res.render("home.handlebars", {
    layout: false,
    header: {
      title:
        "HabibDev. Web Developer with expertiese in React.JS, Node.JS and Spring Boot",
      keywords:
        "HabibWeb, Portfolio, Web Developer, React.JS, Node.JS, Spring Boot",
      description: "This is the home page",
    },
    main: {
      address: address ? address[0].setting_value : "",
      blogPosts: blogPosts ? blogPosts : [],
      linkedin: linkedinLink ? linkedinLink[0].setting_value : "",
      github: githubLink ? githubLink[0].setting_value : "",
      phone_number: phoneNumber ? phoneNumber[0].setting_value : "",
      email_address: emailAddress ? emailAddress[0].setting_value : "",
      projects: projects ? projects : [],
      guestPosts: guestPosts ? guestPosts : [],
    },
    footer: {
      text: `<p class="text-danger">HabibDev. All right reseved ${new Date().getFullYear()}</p>`,
    },
  });
});

router.get("/about", async (req, res) => {
  res.render("about.handlebars", {
    layout: false,
    header: {
      title: "About me",
      keywords: "HabibWeb, Portfolio",
      description: "This is page is about me and my skills",
    },
    main: {
      text: `<p>This is the about page</p><img src="https://placehold.co/200x300" alt="random image"> <p>This is another paragraph</p>`,
    },
    footer: {
      text: `<p>HabibDev. All right reseved ${new Date().getFullYear()}</p>`,
    },
  });
});

const createContactObject = () => {
  return {
    layout: false,
    header: {
      title: "Contact page",
      keywords: "HabibWeb, Portfolio",
      description: "This is the contact page",
    },
    main: {
      text: "This is the contact page",
    },
    footer: {
      text: `<p>HabibDev. All right reseved ${new Date().getFullYear()}</p>`,
    },
  };
};

router.get("/contact", async (req, res) => {
  res.render("contact.handlebars", createContactObject());
});

router.post("/contact", async (req, res) => {
  let name = req.body.name;
  let email = req.body.email;
  let message = req.body.message;
  let contactObject = createContactObject();
  let submissionMessage = `<div class="toast toast-error"><p>Please fill in all the fields.</p></div>`;
  if (!name || !email || !message) {
    contactObject.main.submissionMessage = submissionMessage;
    // send error message to the user
    return res.render("contact.handlebars", contactObject);
  } else {
    // save the message to the database
    let result = await model.saveMessage(name, email, message);
    console.log(result);
    if (!result) {
      console.log("There is an error inside else{}");
      contactObject.main.submissionMessage = `<div class="toast toast-error"><p>Something went wrong, please try again.</p></div>`;
      // if error from database, send error message to the user
      return res.render("contact.handlebars", contactObject);
    }
    console.log("There is no error");
    // send success message to the user
    submissionMessage = `<div class="col-9 toast toast-success"><p>Your message has been sent successfully. I am going to contact you within 24 hours.</p></div>`;
    contactObject.main.submissionMessage = submissionMessage;
    return res.render("contact.handlebars", contactObject);
  }
});

const nextPage = (pages, next) => {
  pages = parseInt(pages);
  next = parseInt(next);

  if (next + 1 == pages) {
    return pages;
  } else {
    return next + 1;
  }
};

router.get("/blog", async (req, res) => {
  // show 3 posts per page
  let page = req.query.page ? req.query.page : 1;
  let limit = 3;
  let offset = (page - 1) * limit;
  let posts = await model.getBlogPosts(limit, offset);
  let totalPosts = await model.countRowsInTable("Blogs");
  totalPosts = totalPosts[0].total;
  let totalPages = totalPosts / limit;

  res.render("blog.handlebars", {
    layout: false,
    header: {
      title: "Blog page",
      keywords: "HabibWeb, Portfolio",
      description: "This is the blog page",
    },
    main: {
      posts: posts ? posts : [],
      prev: parseInt(page) - 1 > 0 ? parseInt(page) - 1 : 1,

      next: parseInt(page) + 1 <= totalPages ? parseInt(page) + 1 : page,

      current: page,
      totalPages: totalPages,
    },
    footer: {
      text: `<p>HabibDev. All right reseved ${new Date().getFullYear()}</p>`,
    },
  });
});

router.get("/blog/page/:page", async (req, res) => {
  // show 3 posts per page
  let page = req.params.page ? req.params.page : 1;
  let limit = 3;
  let offset = (page - 1) * limit;
  let posts = await model.getBlogPosts(limit, offset);
  let totalPosts = await model.countRowsInTable("Blogs");
  totalPosts = totalPosts[0].total;
  let totalPages = parseInt(totalPosts / limit) + 1;
  res.render("blog.handlebars", {
    layout: false,
    header: {
      title: "Blog page",
      keywords: "HabibWeb, Portfolio",
      description: "This is the blog page",
    },
    main: {
      posts: posts ? posts : [],
      prev: parseInt(page) - 1 > 0 ? parseInt(page) - 1 : 1,
      next: parseInt(page) + 1 <= totalPages ? parseInt(page) + 1 : page,
      current: page,
      totalPages: totalPages,
    },
    footer: {
      text: `<p>HabibDev. All right reseved ${new Date().getFullYear()}</p>`,
    },
  });
});

router.get("/blog/:blog_id", async (req, res) => {
  let blog_id = req.params.blog_id;
  let post = await model.getBlogPostById(blog_id);
  res.render("post.handlebars", {
    layout: false,
    header: {
      title: "Blog page",
      keywords: "HabibWeb, Portfolio",
      description: "This is the blog page",
    },
    main: {
      post: post ? post[0] : {},
    },
    footer: {
      text: `<p>HabibDev. All right reseved ${new Date().getFullYear()}</p>`,
    },
  });
});

router.get("/projects", async (req, res) => {
  let limit = 3;
  let page = req.query.page ? req.query.page : 1;
  let offset = (page - 1) * limit;
  let projects = await model.getProjects(limit, offset);
  let totalProjects = await model.countRowsInTable("Projects");
  totalProjects = totalProjects[0].total;
  let totalPages = totalProjects / limit;
  res.render("projects.handlebars", {
    layout: false,
    header: {
      title: "Projects page",
      keywords: "HabibWeb, Portfolio",
      description: "This is the projects page",
    },
    main: {
      projects: projects ? projects : [],
      prev: parseInt(page) - 1 > 0 ? parseInt(page) - 1 : 1,
      next: parseInt(page) + 1 <= totalPages ? parseInt(page) + 1 : page,
      current: page,
    },
    footer: {
      text: `<p>HabibDev. All right reseved ${new Date().getFullYear()}</p>`,
    },
  });
});

router.get("/projects/page/:page", async (req, res) => {
  let page = req.params.page ? req.params.page : 1;
  let limit = 3;
  let offset = (page - 1) * limit;
  let projects = await model.getProjects(limit, offset);
  let totalProjects = await model.countRowsInTable("Projects");
  totalProjects = totalProjects[0].total;
  let totalPages = parseInt(totalProjects / limit) + 1;
  res.render("projects.handlebars", {
    layout: false,
    header: {
      title: "Projects page",
      keywords: "HabibWeb, Portfolio",
      description: "This is the projects page",
    },
    main: {
      projects: projects ? projects : [],
      prev: parseInt(page) - 1 > 0 ? parseInt(page) - 1 : 1,
      next: parseInt(page) + 1 <= totalPages ? parseInt(page) + 1 : page,
      current: page,
      totalPages: totalPages,
    },
    footer: {
      text: `<p>HabibDev. All right reseved ${new Date().getFullYear()}</p>`,
    },
  });
});

router.get("/projects/:project_id", async (req, res) => {
  let project_id = req.params.project_id;
  let project = await model.getProjectById(project_id);
  res.render("project.handlebars", {
    layout: false,
    header: {
      title: "Project page",
      keywords: "HabibWeb, Portfolio",
      description: "This is the project page",
    },
    main: {
      project: project ? project[0] : {},
    },
    footer: {
      text: `<p>HabibDev. All right reseved ${new Date().getFullYear()}</p>`,
    },
  });
});

router.post("/newsletter/subscribe", async (req, res) => {
  let emailAddress = req.body.email;
  let result = await model.addToNewsletter(emailAddress);

  if (result) {
    res.send("You have been subscribed successfully");
  } else {
    res.send("Something went wrong, please try again");
  }
});

router.get("/newsletter/unsubscribe", async (req, res) => {
  let emailAddress = req.body.email;
  let result = await model.deleteNewsLetter(emailAddress);
  if (result) {
    res.send("You have been unsubscribed successfully");
    // wait three seconds then redirect to homepage
    setTimeout(() => {
      res.redirect("/");
    }, 3000);
  } else {
    res.send("Something went wrong, please try again");
  }
});

router.get("newsletter/update", async (req, res) => {
  let emailAddress = req.body.email;
  let newEmailAddress = req.body.newEmail;
  let result = await model.updateNewsLetter(emailAddress, newEmailAddress);
  if (result) {
    res.send("You have been updated successfully");
  } else {
    res.send("Something went wrong, please try again");
  }
});

router.get("/guest-blog", async (req, res) => {
  let limit = 3;
  let page = req.query.page ? req.query.page : 1;
  let offset = (page - 1) * limit;
  let guestPosts = await model.getGuestPosts(limit, offset);
  let totalGuestPosts = await model.countRowsInTable("Guest_Posts");
  totalGuestPosts = totalGuestPosts[0].total;
  let totalPages = totalGuestPosts / limit;
  res.render("guest-blog.handlebars", {
    layout: false,
    header: {
      title: "Guest Blog page",
      keywords: "HabibWeb, Portfolio",
      description: "This is the guest blog page",
    },
    main: {
      guestPosts: guestPosts ? guestPosts : [],
      prev: parseInt(page) - 1 > 0 ? parseInt(page) - 1 : 1,
      next: parseInt(page) + 1 <= totalPages ? parseInt(page) + 1 : page,
      current: page,
      totalPages: totalPages,
    },
    footer: {
      text: `<p>HabibDev. All right reseved ${new Date().getFullYear()}</p>`,
    },
  });
});

router.get("/guest-blog/page/:page", async (req, res) => {
  let page = req.params.page ? req.params.page : 1;
  let limit = 3;
  let offset = (page - 1) * limit;
  let guestPosts = await model.getGuestPosts(limit, offset);
  let totalGuestPosts = await model.countRowsInTable("Guest_Posts");
  totalGuestPosts = totalGuestPosts[0].total;
  let totalPages = parseInt(totalGuestPosts / limit) + 1;
  res.render("guest-blog.handlebars", {
    layout: false,
    header: {
      title: "Guest Blog page",
      keywords: "HabibWeb, Portfolio",
      description: "This is the guest blog page",
    },
    main: {
      guestPosts: guestPosts ? guestPosts : [],
      prev: parseInt(page) - 1 > 0 ? parseInt(page) - 1 : 1,
      next: parseInt(page) + 1 <= totalPages ? parseInt(page) + 1 : page,
      current: page,
      totalPages: totalPages,
    },
    footer: {
      text: `<p>HabibDev. All right reseved ${new Date().getFullYear()}</p>`,
    },
  });
});

router.get("/guest-blog/:guest_post_id", async (req, res) => {
  let guest_post_id = req.params.guest_post_id;
  let guestPost = await model.getGuestPostById(guest_post_id);
  res.render("guest-post.handlebars", {
    layout: false,
    header: {
      title: "Guest Post page",
      keywords: "HabibWeb, Portfolio",
      description: "This is the guest post page",
    },
    main: {
      guestPost: guestPost ? guestPost[0] : {},
    },
    footer: {
      text: `<p>HabibDev. All right reseved ${new Date().getFullYear()}</p>`,
    },
  });
});

module.exports = router;
