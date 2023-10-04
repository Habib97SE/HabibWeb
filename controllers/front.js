const express = require("express");
const model = require("../model/front.js");

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
  let projects = await model.getProjects(3);
  let guestPosts = await model.getGuestPosts(3);
  let address = await model.getAddress();
  res.render("home.handlebars", {
    layout: false,
    header: {
      title: "Home page",
      keywords: "HabibWeb, Portfolio",
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

router.get("/portfolio", async (req, res) => {
  res.sender("portfolio.handlebars", {
    layout: false,
    header: {
      title: "Portfolio",
      keywords: "HabibWeb, Portfolio",
      description: "This is page is about me and my skills",
    },
    main: {
      text: `<P>This is the portfolio page</p>`,
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

router.get("/blog/", async (req, res) => {
  // show 3 posts per page
  let page = req.query.page ? req.query.page : 1;
  let limit = 3;
  let offset = (page - 1) * limit;
  let posts = await model.getBlogPosts(limit, offset);
  res.render("blog.handlebars", {
    layout: false,
    header: {
      title: "Blog page",
      keywords: "HabibWeb, Portfolio",
      description: "This is the blog page",
    },
    main: {
      posts: posts ? posts : [],
      prev: page - 1 > 0 ? page - 1 : 1,
      next: page + 1 > 0 ? page + 1 : 1,
    },
    footer: {
      text: `<p>HabibDev. All right reseved ${new Date().getFullYear()}</p>`,
    },
  });
});

module.exports = router;
