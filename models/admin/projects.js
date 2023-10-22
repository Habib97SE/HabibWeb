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

module.exports.getProjects = (limit, offset) => {
    return new Promise((resolve, reject) => { // return a new Promise
        db.all("SELECT  * FROM Projects ORDER BY created_at DESC LIMIT ? OFFSET ?", [limit, offset], (err, rows) => {
            if (err) {
                // reject the promise if there is an error
                reject({
                    hasError: true,
                    error: err,
                    projects: [],
                });
            } else {
                // resolve the promise with the data if successful
                resolve({
                    hasError: false,
                    error: null,
                    projects: rows,
                });
            }
        });
    });
} // end getProjects()

module.exports.getProject = (projectId) => {
    return new Promise((resolve, reject) => {
        db.get(
            "SELECT * FROM Projects WHERE project_id = ?",
            [projectId],
            (err, row) => {
                if (err) {
                    reject({
                        hasError: true,
                        error: err,
                        project: {},
                    });
                }
                resolve({
                    hasError: false,
                    error: null,
                    project: row,
                });
            }
        );
    }); // end new Promise()
} // end getProject()

module.exports.deleteProject = (projectId) => {
    return new Promise((resolve, reject) => {
        db.run(
            "DELETE FROM Projects WHERE project_id = ?",
            [projectId],
            (err) => {
                if (err) {
                    reject(err);
                }
                resolve(true);
            }
        );
    }); // end new Promise()
} // end deleteProject()

module.exports.updateProject = (project) => {
    return new Promise((resolve, reject) => {
        db.run(
            "UPDATE Projects SET title = ?, content = ?, main_image = ?, updated_at = ? WHERE project_id = ?",
            [project.title, project.content, project.main_image, project.updated_at, project.project_id],
            (err) => {
                if (err) {
                    reject(err);
                }
                resolve(true);
            }
        );
    }); // end new Promise()
} // end updateProject()

module.exports.addProject = (project) => {
    return new Promise((resolve, reject) => {
        db.run(
            "INSERT INTO Projects (title, description, main_image, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
            [project.title, project.description, project.main_image, project.created_at, project.updated_at],
            (err) => {
                if (err) {
                    reject(err);
                }
                resolve(true);
            }
        );
    }); // end new Promise()
}