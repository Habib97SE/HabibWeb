const sqlite = require("sqlite3");
const path = require("path");

const db = new sqlite.Database(
    path.join(__dirname, "../database.db"),
    (err) =>
    {
        if (err)
        {
            console.log(err);
        }
    }
);

module.exports.getUser = (emailAddress) =>
{
    return new Promise((resolve, reject) =>
    {
        db.get(
            "SELECT * FROM Admins WHERE email_address = ?",
            [emailAddress],
            (err, row) =>
            {
                if (err)
                {
                    reject(err);
                }
                resolve(row);
            }
        );
    });
};

module.exports.updateUser = (user) =>
{
    return new Promise((resolve, reject) =>
    {
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
            (err) =>
            {
                if (err)
                {
                    reject(err);
                }
                resolve(true);
            }
        );
    });
};

module.exports.getBlogs = (limit, offset) =>
{
    return new Promise((resolve, reject) =>
    {
        db.all(
            "SELECT * FROM Blogs LIMIT ? OFFSET ?",
            [limit, offset],
            (err, rows) =>
            {
                if (err)
                {
                    reject(err);
                }
                resolve(rows);
            }
        );
    });
};

module.exports.deleteBlog = (blogId) =>
{
    return new Promise((resolve, reject) =>
    {
        db.run("DELETE FROM Blogs WHERE blog_id = ?", [blogId], (err) =>
        {
            if (err)
            {
                reject(err);
            }
            resolve(true);
        });
    });
};

module.exports.getBlog = (blogId) =>
{
    return new Promise((resolve, reject) =>
    {
        let query = "SELECT b.*, a.first_name, a.last_name FROM Blogs b JOIN Admins a ON b.author = a.admin_id WHERE b.blog_id = ?"
        db.get(query, [blogId], (err, row) =>
        {
            if (err)
            {
                reject(err);
            }
            resolve(row);
        });
    });
};

module.exports.updateBlog = (blog) =>
{
    return new Promise((resolve, reject) =>
    {
        db.run(
            "UPDATE Blogs SET title = ?, content = ?, author = ?, main_image = ?, updated_at = ? WHERE blog_id = ?",
            [blog.title, blog.content, blog.author, blog.main_image, blog.updated_at, blog.blog_id],
            (err) =>
            {
                if (err)
                {
                    reject(err);
                }
                resolve(true);
            }
        );
    });
};

module.exports.addBlog = (blog) =>
{
    return new Promise((resolve, reject) =>
    {
        db.run(
            "INSERT INTO Blogs (title, content, author, main_image, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
            [blog.title, blog.content, blog.author, blog.main_image, blog.created_at, blog.updated_at],
            (err) =>
            {
                if (err)
                {
                    reject(err);
                }
                resolve(true);
            }
        );
    });
}


/**
 * Guest blogs CRUD
 */
module.exports.getGuestBlogs = (limit, offset) =>
{
    return new Promise((resolve, reject) =>
    {
        db.all(
            "SELECT guest_post_id, title, content, main_image, author_first_name, author_last_name, created_at, updated_at FROM Guest_Posts LIMIT ? OFFSET ?",
            [limit, offset],
            (err, rows) =>
            {
                if (err)
                {
                    reject(err);
                }
                resolve(rows);
            }
        );
    });
}
module.exports.countRows = (table) =>
{
    return new Promise((resolve, reject) =>
    {
        db.get(
            `SELECT COUNT(*) AS count FROM ${table}`,
            (err, row) =>
            {
                if (err)
                {
                    reject(err);
                }
                resolve(row);
            }
        );
    });
}

module.exports.getGuestBlog = (guestPostId) =>
{
    return new Promise((resolve, reject) =>
    {
        db.get(
            "SELECT * FROM Guest_Posts WHERE guest_post_id = ?",
            [guestPostId],
            (err, row) =>
            {
                if (err)
                {
                    reject(err);
                }
                resolve(row);
            }
        );
    });
}

module.exports.deleteGuestBlog = (guestPostId) =>
{
    return new Promise((resolve, reject) =>
    {
        db.run(
            "DELETE FROM Guest_Posts WHERE guest_post_id = ?",
            [guestPostId],
            (err) =>
            {
                if (err)
                {
                    reject(err);
                }
                resolve(true);
            }
        );
    });
}

module.exports.updateGuestBlog = (guestPost) =>
{
    return new Promise((resolve, reject) =>
    {
        db.run(
            "UPDATE Guest_Posts SET title = ?, content = ?, author_first_name = ?, author_last_name = ?, main_image = ?, updated_at = ? WHERE guest_post_id = ?",
            [guestPost.title, guestPost.content, guestPost.author_first_name, guestPost.author_last_name, guestPost.main_image, guestPost.updated_at, guestPost.guest_post_id],
            (err) =>
            {
                if (err)
                {
                    reject(err);
                }
                resolve(true);
            }
        );
    });
}

module.exports.addGuestBlog = (guest_post) =>
{
    return new Promise((resolve, reject) =>
    {
        db.run(
            "INSERT INTO Guest_Posts (title, content, author_first_name, author_last_name, main_image, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [guest_post.title, guest_post.content, guest_post.author_first_name, guest_post.author_last_name, guest_post.main_image, guest_post.created_at, guest_post.updated_at],
            (err) =>
            {
                if (err)
                {
                    reject(err);
                }
                resolve(true);
            }
        );
    }); // end new Promise()
}; // end addGuestBlog()

module.exports.getProjects = (limit, offset) =>
{
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

module.exports.getProject = (projectId) =>
{
    return new Promise((resolve, reject) =>
    {
        db.get(
            "SELECT * FROM Projects WHERE project_id = ?",
            [projectId],
            (err, row) =>
            {
                if (err)
                {
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

module.exports.deleteProject = (projectId) =>
{
    return new Promise((resolve, reject) =>
    {
        db.run(
            "DELETE FROM Projects WHERE project_id = ?",
            [projectId],
            (err) =>
            {
                if (err)
                {
                    reject(err);
                }
                resolve(true);
            }
        );
    }); // end new Promise()
} // end deleteProject()

module.exports.updateProject = (project) =>
{
    return new Promise((resolve, reject) =>
    {
        db.run(
            "UPDATE Projects SET title = ?, content = ?, main_image = ?, updated_at = ? WHERE project_id = ?",
            [project.title, project.content, project.main_image, project.updated_at, project.project_id],
            (err) =>
            {
                if (err)
                {
                    reject(err);
                }
                resolve(true);
            }
        );
    }); // end new Promise()
} // end updateProject()

module.exports.addProject = (project) =>
{
    return new Promise((resolve, reject) =>
    {
        db.run(
            "INSERT INTO Projects (title, description, main_image, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
            [project.title, project.description, project.main_image, project.created_at, project.updated_at],
            (err) =>
            {
                if (err)
                {
                    reject(err);
                }
                resolve(true);
            }
        );
    }); // end new Promise()
}

module.exports.getSettings = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM Settings", (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
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


module.exports.addSetting = (setting) =>
{
    return new Promise((resolve, reject) =>
    {
        db.run(
            "INSERT INTO Settings (setting_name, setting_value) VALUES (?, ?)",
            [setting.setting_name, setting.setting_value],
            (err) =>
            {
                if (err)
                {
                    reject(err);
                }
                resolve(true);
            }
        );
    }); // end new Promise()
} // end addSetting()
