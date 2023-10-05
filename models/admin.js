const sqlite = require("sqlite3");
const path = require("path");

const db = new sqlite.Database(
  path.join(__dirname, "../database.db"),
  (err) => {
    if (err) {
      console.log(err);
    }
  }
);

module.exports.getUser = (emailAddress) => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM Admins WHERE email_address = ?",
      [emailAddress],
      (err, row) => {
        if (err) {
          reject(err);
        }
        resolve(row);
      }
    );
  });
};
