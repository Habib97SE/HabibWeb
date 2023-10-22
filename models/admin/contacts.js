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

module.exports.getContacts = () => {
    return new Promise((resolve, reject) => {
        db.all(
            "SELECT * FROM Contacts ORDER BY is_read ASC",
            (err, rows) => {
                if (err) {
                    reject({
                        hasError: true,
                        error: err,
                        contacts: [],
                    });
                }
                resolve({
                    hasError: false,
                    error: null,
                    contacts: rows,
                });
            }
        );
    });
};

module.exports.markAsHandled = (contactId) => {
    return new Promise((resolve, reject) => {
        db.run(
            "UPDATE Contacts SET is_read = 1 WHERE contact_id = ?",
            [contactId],
            (err) => {
                if (err) {
                    reject(err);
                }
                resolve(true);
            }
        );
    });
}