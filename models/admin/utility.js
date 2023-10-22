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

module.exports.countRows = (table) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT COUNT(*) AS count FROM ${table}`,
            (err, row) => {
                if (err) {
                    reject(err);
                }
                resolve(row);
            }
        );
    });
}