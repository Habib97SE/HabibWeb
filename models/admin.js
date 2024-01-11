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

module.exports.getLastBlogPost = () => {
    return new Promise((resolve, reject) => {
        db.all(
            "SELECT * FROM Blogs ORDER BY created_at DESC LIMIT 1",
            (err, rows) => {
                if (err) {
                    reject({
                        hasError: true,
                        error: err,
                        blog: null
                    });
                }
                resolve({
                    hasError: false,
                    error: null,
                    blog: rows
                });
            }
        );
    });
}

module.exports.getLastProjectPost = () => {
    return new Promise((resolve, reject) => {
        db.all(
            "SELECT * FROM Projects ORDER BY created_at DESC LIMIT 1",
            (err, rows) => {
                if (err) {
                    reject({
                        hasError: true,
                        error: err,
                        project: null
                    });
                }
                resolve({
                    hasError: false,
                    error: null,
                    project: rows
                });
            }
        );
    });
}

module.exports.countNumberOfRows = (table) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT COUNT(*) FROM ${table}`,
            (err, row) => {
                if (err) {
                    reject(err);
                }
                resolve(row);
            }
        );
    });
}