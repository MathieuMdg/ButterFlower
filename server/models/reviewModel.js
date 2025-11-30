const db = require('../config/db');

exports.getReviewsByAlbum = (albumId, callback) => {
  db.query('SELECT r.*, u.username FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.album_id = ? ORDER BY r.review_date DESC', [albumId], callback);
};

exports.createReview = (review, callback) => {
  const sql = 'INSERT INTO reviews (user_id, album_id, rating, review_text) VALUES (?, ?, ?, ?)';
  db.query(sql, [review.user_id, review.album_id, review.rating, review.review_text], callback);
};

exports.updateReview = (id, review, callback) => {
  const sql = 'UPDATE reviews SET rating = ?, review_text = ? WHERE id = ?';
  db.query(sql, [review.rating, review.review_text, id], callback);
};

exports.deleteReview = (id, callback) => {
  db.query('DELETE FROM reviews WHERE id = ?', [id], callback);
};

exports.getReviewsByUser = (userId, callback) => {
  const sql = `
    SELECT r.*, a.title, a.artist, a.cover_url
    FROM reviews r
    JOIN albums a ON r.album_id = a.id
    WHERE r.user_id = ?
    ORDER BY r.review_date DESC
  `;
  db.query(sql, [userId], callback);
}
