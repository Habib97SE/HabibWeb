const sqlite = require("sqlite3")
const path = require("path")

const db = new sqlite.Database(
    path.join(__dirname, "../", "../", "database.db"),
    (err) => {
        if (err) {
            console.log(err)
        }
    }
);

module.exports.getGuestBlogs = (limit, offset) => {
    return new Promise((resolve, reject) => {

        db.all(
            "SELECT * FROM Guest_Posts LIMIT ? OFFSET ?",
            [limit, offset],
            (err, rows) => {
                if (err) {
                    reject({
                        hasError: true,
                        error: err,
                        guest_posts: [],
                    });
                }
                resolve({
                    hasError: false,
                    error: null,
                    guest_posts: rows,
                });
            }
        );
    });
}

module.exports.getGuestBlog = (guestPostId) => {
    return new Promise((resolve, reject) => {
        db.get(
            "SELECT * FROM Guest_Posts WHERE guest_post_id = ?",
            [guestPostId],
            (err, row) => {
                if (err) {
                    reject({
                        hasError: true,
                        error: err,
                        guest_post: {},
                    });
                }
                resolve({
                    hasError: false,
                    error: null,
                    guest_post: row,
                });
            }
        );
    });
}

module.exports.deleteGuestBlog = (guestPostId) => {
    return new Promise((resolve, reject) => {
        db.run(
            "DELETE FROM Guest_Posts WHERE guest_post_id = ?",
            [guestPostId],
            (err) => {
                if (err) {
                    reject(err);
                }
                resolve(true);
            }
        );
    });
}

module.exports.updateGuestBlog = (guestPost) => {
    return new Promise((resolve, reject) => {
        db.run(
            "UPDATE Guest_Posts SET title = ?, content = ?, author_first_name = ?, author_last_name = ?, main_image = ?, updated_at = ? WHERE guest_post_id = ?",
            [guestPost.title, guestPost.content, guestPost.author_first_name, guestPost.author_last_name, guestPost.main_image, guestPost.updated_at, guestPost.guest_post_id],
            (err) => {
                if (err) {
                    reject(err);
                }
                resolve(true);
            }
        );
    });
}

module.exports.addGuestBlog = (guest_post) => {
    return new Promise((resolve, reject) => {
        db.run(
            "INSERT INTO Guest_Posts (title, content, author_first_name, author_last_name, main_image, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [guest_post.title, guest_post.content, guest_post.author_first_name, guest_post.author_last_name, guest_post.main_image, guest_post.created_at, guest_post.updated_at],
            (err) => {
                if (err) {
                    reject(err);
                }
                resolve(true);
            }
        );
    }); // end new Promise()
}; // end addGuestBlog()

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