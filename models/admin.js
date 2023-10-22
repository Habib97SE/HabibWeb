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

module.exports.updateUser = (user) => {
    return new Promise((resolve, reject) => {
        db.run(
            "UPDATE Admins SET first_name = ?, last_name = ?, email_address = ?, password = ?, updated_at = ? WHERE admin_id = ?",
            [
                user.first_name,
                user.last_name,
                user.email_address,
                user.password,
                user.updated_at,
                user.admin_id,
            ],
            (err) => {
                if (err) {
                    reject(err);
                }
                resolve(true);
            }
        );
    });
};