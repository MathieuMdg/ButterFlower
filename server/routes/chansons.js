const express = require('express');
const router = express.Router();
const db = require('../config/db');


// ✅ Routes spécifiques EN PREMIER

// Chansons aléatoires
router.get('/random', (req, res) => {
  const sql = `
    SELECT c.*, a.title as album_title, a.cover_url, a.artist
    FROM chansons c
    JOIN albums a ON c.album_id = a.id
    ORDER BY RAND()
    LIMIT 10
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).send('Erreur serveur');
    res.json(rows);
  });
});


// Chansons d'un album
router.get('/album/:albumId', (req, res) => {
  const albumId = req.params.albumId;
  db.query(
    'SELECT * FROM chansons WHERE album_id = ?',
    [albumId],
    (err, rows) => {
      if (err) return res.status(500).send("Erreur serveur");
      res.json(rows);
    }
  );
});


// ✅ Routes avec paramètres APRÈS

// Récupérer la note d'un utilisateur pour une chanson
router.get('/:id/note/:userId', (req, res) => {
  const { id, userId } = req.params;
  db.query(
    'SELECT note FROM notes_chansons WHERE chanson_id = ? AND user_id = ?',
    [id, userId],
    (err, rows) => {
      if (err) return res.status(500).send('Erreur serveur');
      if (rows.length === 0) return res.json({ note: null });
      res.json({ note: rows[0].note });
    }
  );
});


// Enregistrer ou modifier une note pour une chanson
router.post('/:id/note', (req, res) => {
  const chansonId = req.params.id;
  const { user_id, note } = req.body;

  if (!user_id || !note) {
    return res.status(400).send('user_id et note requis');
  }

  const sql = `
    INSERT INTO notes_chansons (chanson_id, user_id, note)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE note = ?
  `;
  db.query(sql, [chansonId, user_id, note, note], (err) => {
    if (err) return res.status(500).send('Erreur serveur');
    res.json({ success: true, note });
  });
});


module.exports = router;
