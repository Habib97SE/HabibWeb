const sqlite = require("sqlite3");
const path = require("path");
const express = require("express");
const { rejects } = require("assert");

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

module.exports.createNewsLetter = (email) => {
  return new Promise((resolve, reject) => {
    db.run("INSERT INTO NewsLetter (email) VALUES (?)", email, (err, rows) => {
      if (err) {
        reject(err);
      }
      resolve(rows);
    });
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
      "SELECT * FROM Blogs ORDER BY created_at DESC LIMIT ? OFFSET ?",
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
