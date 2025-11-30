const db = require('../config/db');

exports.getAllAlbums = (callback) => {
  db.query('SELECT * FROM albums', callback);
};

exports.getAlbumById = (id, callback) => {
  db.query('SELECT * FROM albums WHERE id = ?', [id], callback);
};

exports.createAlbum = (album, callback) => {
  const sql = 'INSERT INTO albums (title, artist, cover_url, release_year, genre) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [album.title, album.artist, album.cover_url, album.release_year, album.genre], callback);
};

exports.updateAlbum = (id, album, callback) => {
  const sql = 'UPDATE albums SET title = ?, artist = ?, cover_url = ?, release_year = ?, genre = ? WHERE id = ?';
  db.query(sql, [album.title, album.artist, album.cover_url, album.release_year, album.genre, id], callback);
};

exports.deleteAlbum = (id, callback) => {
  db.query('DELETE FROM albums WHERE id = ?', [id], callback);
};
