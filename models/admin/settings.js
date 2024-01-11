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

module.exports.updateSettings = (settings) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            settings.forEach((setting) => {
                // Extract key and value from each setting object
                const settingName = Object.keys(setting)[0];
                const settingValue = setting[settingName][0]; // Assuming the value is always an array with a single element

                db.run(
                    "UPDATE Settings SET setting_value = ? WHERE setting_name = ?",
                    [settingValue, settingName],
                    (err) => {
                        if (err) {
                            reject(err);
                        }
                    }
                );
            });
            resolve(true);
        });
    });
}