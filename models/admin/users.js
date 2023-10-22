const sqlite = require("sqlite3");
const path = require("path");

const db = new sqlite.Database(
    path.join(__dirname, "../", "../", "database.db"),
    (err) => {
        if (err) {
            console.log(err);
        }
    }
);


module.exports.getUsers = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT u.user_id AS id, u.first_name, u.last_name, u.email_address, u.created_at, u.updated_at, 'user' AS role FROM Users u UNION ALL SELECT a.admin_id AS id, a.first_name, a.last_name, a.email_address, a.created_at, a.updated_at, 'admin' AS role FROM Admins a", (err, rows) => {
            if (err) {
                reject({
                    hasError: true,
                    error: err,
                    users: null
                });
            }
            resolve({
                hasError: false,
                error: null,
                users: rows
            });
        });
    });
};

module.exports.getUser = (id) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT u.user_id AS id, u.first_name, u.last_name, u.email_address FROM Users u WHERE user_id = ?", id, (err, row) => {
            if (err) {
                reject({
                    hasError: true,
                    error: err,
                    user: null
                });
            }
            resolve({
                hasError: false,
                error: null,
                user: row
            });
        });
    });
};

module.exports.getAdmin = (id) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT a.admin_id AS id, a.first_name, a.last_name, a.email_address FROM Admins a WHERE admin_id = ?", id, (err, row) => {
            if (err) {
                reject({
                    hasError: true,
                    error: err,
                    user: null
                });
            }
            resolve({
                hasError: false,
                error: null,
                user: row
            });
        });
    });
}

module.exports.deleteUser = (id) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM Users WHERE id = ?", id, (err) => {
            if (err) {
                reject({
                    hasError: true,
                    error: err
                });
            }
            resolve({
                hasError: false,
                error: null
            });
        });
    });
};

module.exports.updateUser = (id, first_name, last_name, email_address, password, updated_at) => {
    return new Promise((resolve, reject) => {
        db.run("UPDATE Users SET first_name = ?, last_name = ?, email_address = ?, password = ?, updated_at = ? WHERE user_id = ?", first_name, last_name, email_address, password, updated_at, id, (err) => {
            if (err) {
                reject({
                    hasError: true,
                    error: err
                });
            }
            resolve({
                hasError: false,
                error: null
            });
        });
    });
}

module.exports.updateAdmin = (id, first_name, last_name, email_address, password, updated_at) => {
    return new Promise((resolve, reject) => {
        db.run("UPDATE Admins SET first_name = ?, last_name = ?, email_address = ?, password = ?, updated_at = ? WHERE admin_id = ?", first_name, last_name, email_address, password, updated_at, id, (err) => {
            if (err) {
                reject({
                    hasError: true,
                    error: err
                });
            }
            resolve({
                hasError: false,
                error: null
            });
        });
    });
}

module.exports.deleteUser = (id) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM Users WHERE user_id = ?", id, (err) => {
            if (err) {
                reject({
                    hasError: true,
                    error: err
                });
            }
            resolve({
                hasError: false,
                error: null
            });
        });
    });
};

module.exports.deleteAdmin = (id) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM Admins WHERE admin_id = ?", id, (err) => {
            if (err) {
                reject({
                    hasError: true,
                    error: err
                });
            }
            resolve({
                hasError: false,
                error: null
            });
        });
    });
};

module.exports.createUser = (first_name, last_name, email_address, password, created_at, updated_at) => {
    return new Promise((resolve, reject) => {
        db.run("INSERT INTO Users (first_name, last_name, email_address, password, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)", first_name, last_name, email_address, password, created_at, updated_at, (err) => {
            if (err) {
                reject({
                    hasError: true,
                    error: err
                });
            }
            resolve({
                hasError: false,
                error: null
            });
        });
    });
};

module.exports.createAdmin = (first_name, last_name, email_address, password, created_at, updated_at) => {
    return new Promise((resolve, reject) => {
        db.run("INSERT INTO Admins (first_name, last_name, email_address, password, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)", first_name, last_name, email_address, password, created_at, updated_at, (err) => {
            if (err) {
                reject({
                    hasError: true,
                    error: err
                });
            }
            resolve({
                hasError: false,
                error: null
            });
        });
    });
};