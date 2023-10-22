const express = require("express");
const model = require("../models/front.js");
const bcrypt = require("bcrypt");
const {
  parse
} = require("handlebars");

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
      title: "HabibDev. Web Developer with expertiese in React.JS, Node.JS and Spring Boot",
      keywords: "HabibWeb, Portfolio, Web Developer, React.JS, Node.JS, Spring Boot",
      description: "This is the home page",
    },
    main: {
      user: req.session.user ? req.session.user : null,
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
      user: req.session.user ? req.session.user : null,
      text: `
      <div class="col-6 col-mx-auto my-2">
       <img width = "500px"
      src = "/images/about.jpg"
      alt = "about me" />
      </div>
      <p>Hello, and welcome to my portfolio!

I'm Habib Hezarehee, a computer science enthusiast and undergraduate student deeply passionate about technology and coding. My journey in programming commenced with C++, a powerful language that laid the foundation for my understanding of various computing concepts. Since then, my repertoire has expanded to include Java and JavaScript, allowing me to develop diverse projects ranging from simple algorithms to interactive web applications.</p>
<ol>
Some of the languages and frameworks I've worked with include:
<li>Java</li>
<li>JavaScript</li>
<li>React.JS</li>
<li>Node.JS</li>
<li>Spring Boot</li>
<li>SQL</li>
<li>HTML</li>
<li>CSS</li>
<li>Bootstrap</li>
<li>Git</li>

</ol>
<p>My skill set doesn't stop with programming languages, though. I've immersed myself in the world of modern technology, gaining broad knowledge in cutting-edge fields and tools. I'm proficient with Microsoft Azure, where I've learned to manage cloud services and resources, ensuring optimal, scalable, and secure operations. I've also delved into the intricacies of Kafka, which has equipped me with valuable insights into real-time data processing and big data.</p>

<p>But I'm not just about technical skills. I'm a problem-solver at heart, with a passion for diving deep into challenges and emerging with strategic solutions. I thrive in collaborative settings, where brainstorming and team efforts lead to innovation and success. My time in university isn't just about earning a degree; it's about making a difference and contributing to projects that have the potential to transform the digital landscape.

This portfolio is a window into my professional life, showcasing projects that I've poured my heart and intellect into. As I continue to evolve and learn, I seek opportunities for internships, collaborative projects, and experiences that will drive my professional growth and enable me to make meaningful contributions to the tech community.</p>

<p>Thank you for visiting, and I invite you to explore my projects, delve into my blog, or contact me directly to discuss potential collaborations, opportunities, or just to exchange ideas!</p>

<p>Best Regards,
<br />
Habib Hezarehee</p>`,
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
      user: req.session.user ? req.session.user : null,
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
  let currentPagee = req.query.page ? req.query.page : 1;
  currentPagee = parseInt(currentPagee);
  let limit = 3;
  let offset = (currentPagee - 1) * limit;
  let totalRows = await model.countRowsInTable("Blogs");
  totalRows = totalRows[0].total;
  let totalPages = parseInt(totalRows / limit) + 1;
  let nextPagee = currentPagee < totalPages ? currentPagee + 1 : null;
  let prevPagee = currentPagee > 1 ? currentPagee - 1 : null;
  let posts = await model.getBlogPosts(limit, offset);


  res.render("blog.handlebars", {
    layout: false,
    header: {
      title: "Blog page",
      keywords: "HabibWeb, Portfolio",
      description: "This is the blog page",
    },
    main: {
      user: req.session.user ? req.session.user : null,
      posts: posts ? posts : [],
      hasMultiplePages: totalPages > 1,
      prev: prevPagee,
      next: nextPagee,
      currentPage: currentPagee,
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
      user: req.session.user ? req.session.user : null,
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
      user: req.session.user ? req.session.user : null,
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
      user: req.session.user ? req.session.user : null,
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
      user: req.session.user ? req.session.user : null,
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

router.get("/guest-blogs", async (req, res) => {
  let page = req.query.page ? req.query.page : 1;
  page = parseInt(page);
  let limit = 3;
  let offset = (page - 1) * limit;
  let totalRows = await model.countRowsInTable("Guest_Posts");
  totalRows = totalRows[0].total;
  let totalPages = parseInt(totalRows / limit) + 1;
  let nextPage = page < totalPages ? page + 1 : null;
  let prevPage = page > 1 ? page - 1 : null;
  let guestPosts = await model.getGuestPosts(limit, offset);




  res.render("guest-blog.handlebars", {
    layout: false,
    header: {
      title: "Guest Blog page",
      keywords: "HabibWeb, Portfolio",
      description: "This is the guest blog page",
    },
    main: {
      user: req.session.user ? req.session.user : null,
      guestPosts: guestPosts ? guestPosts : [],
      hasMultiplePages: totalPages > 1,
      prev: prevPage,
      next: nextPage,
      current: page,
      totalPages: totalPages,
    },
    footer: {
      text: `<p>HabibDev. All right reseved ${new Date().getFullYear()}</p>`,
    },
  });
});


router.get("/guest-blogs/:guest_post_id", async (req, res) => {
  let guest_post_id = req.params.guest_post_id;
  let guestPost = await model.getGuestPostById(guest_post_id);
  res.render("post.handlebars", {
    layout: false,
    header: {
      title: "Guest Post page",
      keywords: "HabibDev., Portfolio",
      description: "This is the guest post page",
    },
    main: {
      user: req.session.user ? req.session.user : null,
      post: guestPost ? guestPost[0] : {},
    },
    footer: {
      text: `<p>HabibDev. All right reseved ${new Date().getFullYear()}</p>`,
    },
  });
});

router.get("/login", (req, res) => {
  if (req.session.user) {
    res.redirect("/");
    return;
  }
  const error = req.session.errorMessage ? req.session.errorMessage : null;
  delete req.session.errorMessage;
  res.render("login.handlebars", {
    layout: false,
    header: {
      title: "Login page",
      keywords: "HabibDev., Portfolio",
      description: "This is the login page",
    },
    main: {
      user: req.session.user ? req.session.user : null,
      error: error,
      text: "This is the login page",
    },
    footer: {
      text: `<p>HabibDev. All right reseved ${new Date().getFullYear()}</p>`,
    },

  })
})

router.post("/login", (req, res) => {
  if (req.session.user) {
    res.redirect("/");
    return;
  }
  const email_address = req.body.email;
  const password = req.body.password;



  if (email_address == "" || password == "") {
    req.session.errorMessage = "Please fill in all the fields";
    res.redirect("/login");
    return;
  }

  if (password.length < 8) {
    req.session.errorMessage = "Password must be at least 8 characters";
    res.redirect("/login");
    return;
  }


  model.getUserByEmail(email_address).then((result) => {
    console.dir(result);
    if (result.hasError) {
      req.session.errorMessage = "Something went wrong, please try again";
      res.redirect("/login");
      return;
    }
    if (result.user.length == 0) {
      req.session.errorMessage = "The email address or password is incorrect";
      res.redirect("/login");
      return;
    }
    const user = result.user[0];
    console.dir(user);
    bcrypt.compare(password, user.password, (err, same) => {
      if (err) {
        req.session.errorMessage = "Something went wrong, please try again";
        res.redirect("/login");
        return;
      }
      if (!same) {
        req.session.errorMessage = "The email address or password is incorrect";
        res.redirect("/login");
        return;
      }
      // remove password from user 
      delete user.password;
      req.session.user = user;
      console.log("req.session.user");
      console.dir(req.session.user);
      res.redirect("/");
      return;
    })
  })

})

router.get("/logout", (req, res) => {
  if (req.session.user) {
    delete req.session.user;
  } else {
    res.redirect("/");
  }
})

router.get("/register", (req, res) => {
  const error = req.session.errorMessage ? req.session.errorMessage : null;
  delete req.session.errorMessage;
  res.render("register.handlebars", {
    layout: false,
    header: {
      title: "Register page",
      keywords: "HabibDev., Portfolio",
      description: "This is the register page",
    },
    main: {
      user: req.session.user ? req.session.user : null,
      error: error,
      text: "This is the register page",
    },
    footer: {
      text: `<p>HabibDev. All right reseved ${new Date().getFullYear()}</p>`,
    },

  })
})

router.post("/register", (req, res) => {
  if (req.session.user) {
    res.redirect("/");
    return;
  }
  const email_address = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.password_confirm;
  const first_name = req.body.first_name;
  const last_name = req.body.last_name;

  if (email_address == "" || password == "" || confirmPassword == "" || first_name == "" || last_name == "") {
    req.session.errorMessage = "Please fill in all the fields";
    res.redirect("/register");
    return;
  }

  if (password != confirmPassword) {
    req.session.errorMessage = "Passwords do not match";
    res.redirect("/register");
    return;
  }

  if (password.length < 8) {
    req.session.errorMessage = "Password must be at least 8 characters";
    res.redirect("/register");
    return;
  }

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      req.session.errorMessage = "Something went wrong, please try again";
      res.redirect("/register");
      return;
    }
    const created_at = new Date().toISOString();
    const updated_at = new Date().toISOString();
    model.registerUser(first_name, last_name, email_address, hash, created_at, updated_at).then((result) => {
      if (result.hasError) {
        req.session.errorMessage = "Something went wrong, please try again \n " + result.error;
        res.redirect("/register");
        return;
      }
      res.redirect("/login");
      return;
    })
  })

})



module.exports = router;