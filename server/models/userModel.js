const db = require('../config/db');

exports.createUser = (user, callback) => {
  const sql = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
  db.query(sql, [user.username, user.email, user.password, user.role], callback);
};

exports.findUserByEmail = (email, callback) => {
  db.query('SELECT * FROM users WHERE email = ?', [email], callback);
};

exports.findUserById = (id, callback) => {
  db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
    callback(err, results ? results[0] : null);
  });
};

exports.setCanComment = (userId, canComment, callback) => {
  db.query(
    'UPDATE users SET can_comment = ? WHERE id = ?',
    [canComment ? 1 : 0, userId],
    callback
  );
};

exports.getAllUsers = (cb) => {
  db.query('SELECT id, username, email, role, can_comment FROM users', cb);
};