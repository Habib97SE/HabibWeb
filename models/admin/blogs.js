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

module.exports.getBlogs = (limit, offset) => {
    return new Promise((resolve, reject) => {
        db.all(
            "SELECT * FROM Blogs LIMIT ? OFFSET ?",
            [limit, offset],
            (err, rows) => {
                if (err) {
                    reject({
                        hasError: true,
                        error: err,
                        blogs: [],
                    });
                }
                resolve({
                    hasError: false,
                    error: null,
                    blogs: rows,
                });
            }
        );
    });
};

module.exports.deleteBlog = (blogId) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM Blogs WHERE blog_id = ?", [blogId], (err) => {
            if (err) {
                reject(err);
            }
            resolve(true);
        });
    });
};

module.exports.getBlog = (blogId) => {
    return new Promise((resolve, reject) => {
        let query = "SELECT b.*, a.first_name, a.last_name FROM Blogs b JOIN Admins a ON b.author = a.admin_id WHERE b.blog_id = ?"
        db.get(query, [blogId], (err, row) => {
            if (err) {
                reject({
                    hasError: true,
                    error: err,
                    blog: {},
                });
            }
            resolve({
                hasError: false,
                error: null,
                blog: row,
            });
        });
    });
};

module.exports.updateBlog = (blog) => {
    return new Promise((resolve, reject) => {
        db.run(
            "UPDATE Blogs SET title = ?, content = ?, author = ?, main_image = ?, updated_at = ? WHERE blog_id = ?",
            [blog.title, blog.content, blog.author, blog.main_image, blog.updated_at, blog.blog_id],
            (err) => {
                if (err) {
                    reject(err);
                }
                resolve(true);
            }
        );
    });
};

module.exports.addBlog = (blog) => {
    return new Promise((resolve, reject) => {
        db.run(
            "INSERT INTO Blogs (title, content, author, main_image, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
            [blog.title, blog.content, blog.author, blog.main_image, blog.created_at, blog.updated_at],
            (err) => {
                if (err) {
                    reject(err);
                }
                resolve(true);
            }
        );
    });
}

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