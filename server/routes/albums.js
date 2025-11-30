const express = require('express');
const router = express.Router();
const albumModel = require('../models/albumModel');
const db = require('../config/db');
const jwt = require('jsonwebtoken');

// ═══════════════════════════════════════════════════════════
// MIDDLEWARE - Vérification admin
// ═══════════════════════════════════════════════════════════
function isAdmin(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(403).json({ error: 'Non autorisé' });
  try {
    const payload = jwt.verify(token, 'secret'); // Même clé que tes autres fichiers
    if (payload.role === 'admin') next();
    else res.status(403).json({ error: 'Non autorisé' });
  } catch {
    res.status(401).json({ error: 'Token invalide' });
  }
}

// ═══════════════════════════════════════════════════════════
// ROUTES GET PUBLIQUES
// ═══════════════════════════════════════════════════════════

// Albums recommandés
router.get('/recommended', (req, res) => {
  const recommendedIds = [1, 4, 7, 10];
  const sql = `
    SELECT a.*, AVG(r.rating) as average_rating
    FROM albums a
    LEFT JOIN reviews r ON a.id = r.album_id
    WHERE a.id IN (?)
    GROUP BY a.id
  `;
  db.query(sql, [recommendedIds], (err, rows) => {
    if (err) return res.status(500).send('Erreur serveur');
    res.json(rows);
  });
});

// Albums les mieux notés
router.get('/top-rated', (req, res) => {
  const sql = `
    SELECT a.*, AVG(r.rating) as average_rating, COUNT(r.id) as nb_reviews
    FROM albums a
    LEFT JOIN reviews r ON a.id = r.album_id
    GROUP BY a.id
    HAVING nb_reviews > 0
    ORDER BY average_rating DESC
    LIMIT 10
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).send('Erreur serveur');
    res.json(rows);
  });
});

// Albums les plus récents
router.get('/recent', (req, res) => {
  const sql = `
    SELECT a.*, AVG(r.rating) as average_rating
    FROM albums a
    LEFT JOIN reviews r ON a.id = r.album_id
    GROUP BY a.id
    ORDER BY a.release_year DESC
    LIMIT 10
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).send('Erreur serveur');
    res.json(rows);
  });
});

// Albums les mieux notés par un utilisateur
router.get('/user/:userId/top-rated', (req, res) => {
  const userId = req.params.userId;
  const sql = `
    SELECT a.*, r.rating as user_rating
    FROM albums a
    JOIN reviews r ON a.id = r.album_id
    WHERE r.user_id = ?
    ORDER BY r.rating DESC
    LIMIT 10
  `;
  db.query(sql, [userId], (err, rows) => {
    if (err) return res.status(500).send('Erreur serveur');
    res.json(rows);
  });
});

// Liste tous les albums
router.get('/', (req, res) => {
  const sql = `
    SELECT
      a.*,
      AVG(r.rating) as average_rating,
      COUNT(r.id) as nb_reviews
    FROM albums a
    LEFT JOIN reviews r ON a.id = r.album_id
    GROUP BY a.id
    ORDER BY a.release_year DESC
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).send('Erreur serveur');
    res.json(rows);
  });
});

// Détail d'un album par ID
router.get('/:id', (req, res) => {
  const albumId = req.params.id;
  db.query('SELECT * FROM albums WHERE id = ?', [albumId], (err, rows) => {
    if (err) return res.status(500).send('Erreur serveur');
    if (!rows.length) return res.status(404).send('Album non trouvé');
    res.json(rows[0]);
  });
});

// Chansons d'un album
router.get('/:id/chansons', (req, res) => {
  const albumId = req.params.id;
  db.query('SELECT * FROM chansons WHERE album_id = ?', [albumId], (err, rows) => {
    if (err) return res.status(500).send('Erreur serveur');
    res.json(rows);
  });
});

// ═══════════════════════════════════════════════════════════
// ROUTES ADMIN (POST, PUT, DELETE)
// ═══════════════════════════════════════════════════════════

// Ajouter un nouvel album
router.post('/', isAdmin, (req, res) => {
  const { title, artist, release_year, genre, cover_url } = req.body;
  
  if (!title || !artist) {
    return res.status(400).send('Titre et artiste requis');
  }
  
  const sql = `
    INSERT INTO albums (title, artist, release_year, genre, cover_url)
    VALUES (?, ?, ?, ?, ?)
  `;
  
  db.query(sql, [title, artist, release_year || null, genre || null, cover_url || null], (err, result) => {
    if (err) return res.status(500).send('Erreur serveur');
    res.json({ 
      success: true, 
      message: 'Album ajouté avec succès',
      albumId: result.insertId 
    });
  });
});

// Modifier un album
router.put('/:id', isAdmin, (req, res) => {
  const albumId = req.params.id;
  const { title, artist, release_year, genre, cover_url } = req.body;
  
  if (!title || !artist) {
    return res.status(400).send('Titre et artiste requis');
  }
  
  const sql = `
    UPDATE albums 
    SET title = ?, artist = ?, release_year = ?, genre = ?, cover_url = ?
    WHERE id = ?
  `;
  
  db.query(sql, [title, artist, release_year, genre, cover_url, albumId], (err, result) => {
    if (err) return res.status(500).send('Erreur serveur');
    if (result.affectedRows === 0) {
      return res.status(404).send('Album non trouvé');
    }
    res.json({ success: true, message: 'Album modifié avec succès' });
  });
});

// Supprimer un album
router.delete('/:id', isAdmin, (req, res) => {
  const albumId = req.params.id;
  
  // Supprimer les notes des chansons
  db.query('DELETE FROM notes_chansons WHERE chanson_id IN (SELECT id FROM chansons WHERE album_id = ?)', [albumId], (err) => {
    if (err) return res.status(500).send('Erreur serveur');
    
    // Supprimer les chansons
    db.query('DELETE FROM chansons WHERE album_id = ?', [albumId], (err) => {
      if (err) return res.status(500).send('Erreur serveur');
      
      // Supprimer les reviews
      db.query('DELETE FROM reviews WHERE album_id = ?', [albumId], (err) => {
        if (err) return res.status(500).send('Erreur serveur');
        
        // Supprimer l'album
        db.query('DELETE FROM albums WHERE id = ?', [albumId], (err, result) => {
          if (err) return res.status(500).send('Erreur serveur');
          if (result.affectedRows === 0) {
            return res.status(404).send('Album non trouvé');
          }
          res.json({ success: true, message: 'Album supprimé avec succès' });
        });
      });
    });
  });
});

module.exports = router;
