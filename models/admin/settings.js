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

module.exports.getSettings = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM Settings", (err, rows) => {
            if (err) {
                reject({
                    hasError: true,
                    error: err,
                    settings: [],
                });
            }
            resolve({
                hasError: false,
                error: null,
                settings: rows,
            });
        }); // end db.all()
    }); // end new Promise()
} // end getSettings()

module.exports.updateSetting = (setting_name, setting_value) => {
    return new Promise((resolve, reject) => {
        db.run(
            "UPDATE Settings SET setting_value = ? WHERE setting_name = ?",
            [setting_value, setting_name],
            (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            }
        );
    });
};


module.exports.addSetting = (setting) => {
    return new Promise((resolve, reject) => {
        db.run(
            "INSERT INTO Settings (setting_name, setting_value) VALUES (?, ?)",
            [setting.setting_name, setting.setting_value],
            (err) => {
                if (err) {
                    reject(err);
                }
                resolve(true);
            }
        );
    }); // end new Promise()
} // end addSetting()