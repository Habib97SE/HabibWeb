const sqlite = require("sqlite3");
const path = require("path");
const express = require("express");
const {
  rejects
} = require("assert");

// blog posts table: Blog
// guest posts table: Guest_Posts
// Admin table: Admins
// Portfolio table: Projects
// Settings table: Settings
// NewsLetter table: NewsLetter

const db = new sqlite.Database(path.join(__dirname, "../database.db"));

module.exports.getLinkedinLink = () => {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT setting_value FROM Settings WHERE setting_name = 'linkedin'",
      (err, rows) => {
        if (err) {
          reject(err);
        }
        resolve(rows);
      }
    );
  });
};

module.exports.getGithubLink = () => {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT setting_value FROM Settings WHERE setting_name = 'github'",
      (err, rows) => {
        if (err) {
          reject(err);
        }
        resolve(rows);
      }
    );
  });
};

module.exports.getPhoneNumber = () => {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT setting_value FROM Settings WHERE setting_name = 'phone_number'",
      (err, rows) => {
        if (err) {
          reject(err);
        }
        resolve(rows);
      }
    );
  });
};

module.exports.getEmailAddress = () => {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT setting_value FROM Settings WHERE setting_name = 'email_address'",
      (err, rows) => {
        if (err) {
          reject(err);
        }
        resolve(rows);
      }
    );
  });
};

module.exports.getAddress = () => {
  return new Promise((resolve, rejects) => {
    db.all(
      "SELECT setting_value FROM Settings WHERE setting_name = 'address'",
      (err, rows) => {
        if (err) {
          rejects(err);
        }
        resolve(rows);
      }
    );
  });
};

module.exports.getGuestPosts = (limit) => {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM Guest_Posts ORDER BY created_at DESC LIMIT ?",
      limit,
      (err, rows) => {
        if (err) {
          reject(err);
        }
        resolve(rows);
      }
    );
  });
};

module.exports.getProjects = (limit) => {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM Projects ORDER BY created_at DESC LIMIT ?",
      limit,
      (err, rows) => {
        if (err) {
          reject(err);
        }
        resolve(rows);
      }
    );
  });
};

module.exports.saveMessage = (name, email, message) => {
  let received_at = new Date().toISOString();
  received_at = received_at.slice(0, 19).replace("T", " ");
  let is_read = 0;
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO Contacts (name, email, message, received_at, is_read) VALUES (?, ?, ?, ?, ?)",
      [name, email, message, received_at, is_read],
      (err, rows) => {
        if (err) {
          // return false if there is an error
          reject(false);
        }
        resolve(true);
      }
    );
  });
};

module.exports.getBlogPosts = (limit, offset) => {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT b.*, a.first_name || ' ' || a.last_name AS full_name FROM Blogs AS b JOIN Admins AS a ON b.author = a.admin_id ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [limit, offset],
      (err, rows) => {
        if (err) {
          reject(err);
        }
        resolve(rows);
      }
    );
  });
};

module.exports.countRowsInTable = (table_name) => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT COUNT(*) AS total FROM ${table_name}`, (err, rows) => {
      if (err) {
        reject(err);
      }
      resolve(rows);
    });
  });
};

module.exports.getBlogPostById = (blog_id) => {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT b.*, a.first_name || ' ' || a.last_name AS full_name FROM Blogs AS b JOIN Admins AS a ON b.author = a.admin_id WHERE blog_id = ?",
      blog_id,
      (err, rows) => {
        if (err) {
          reject(err);
        }
        resolve(rows);
      }
    );
  });
};

module.exports.getProjects = (limit, offset) => {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM Projects ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [limit, offset],
      (err, rows) => {
        if (err) {
          reject(err);
        }
        resolve(rows);
      }
    );
  });
};

module.exports.getProjectById = (project_id) => {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM Projects WHERE project_id = ?",
      project_id,
      (err, rows) => {
        if (err) {
          reject(err);
        }
        resolve(rows);
      }
    );
  });
};

module.exports.addToNewsletter = (emailAddress) => {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO Newsletter (email_address) VALUES (?)",
      emailAddress,
      (err, rows) => {
        if (err) {
          reject(err);
        }
        resolve(true);
      }
    );
  });
};

module.exports.deleteNewsLetter = (emailAddress) => {
  return new Promise((resolve, reject) => {
    db.run(
      "DELETE FROM Newsletter WHERE email_address = ?",
      emailAddress,
      (err, rows) => {
        if (err) {
          reject(err);
        }
        resolve(rows);
      }
    );
  });
};

module.exports.updateNewsLetter = (emailAddress, newEmailAddress) => {
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE Newsletter SET email_address = ? WHERE email_address = ?",
      [newEmailAddress, emailAddress],
      (err, rows) => {
        if (err) {
          reject(false);
        }
        resolve(true);
      }
    );
  });
};

module.exports.getGuestPosts = (limit, offset) => {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM Guest_Posts ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [limit, offset],
      (err, rows) => {
        if (err) {
          reject(err);
        }
        resolve(rows);
      }
    );
  });
};

module.exports.getGuestPostById = (guest_post_id) => {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM Guest_Posts WHERE guest_post_id = ?",
      guest_post_id,
      (err, rows) => {
        if (err) {
          reject(err);
        }
        resolve(rows);
      }
    );
  });
};