const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /blindtest/questions - Récupère 10 questions aléatoires
router.get('/questions', (req, res) => {
  const query = `
    SELECT 
      c.id,
      c.titre,
      c.url_audio,
      c.paroles,
      a.id AS album_id,
      a.title AS album_title,
      a.artist,
      a.cover_url,
      a.release_year,
      a.genre
    FROM chansons c
    JOIN albums a ON c.album_id = a.id
    WHERE c.url_audio IS NOT NULL AND c.url_audio != ''
    ORDER BY RAND()
    LIMIT 10
  `;

  db.query(query, (error, chansons) => {
    if (error) {
      console.error('Erreur blind test:', error);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    if (chansons.length === 0) {
      return res.status(404).json({ error: 'Pas assez de chansons disponibles pour le blind test' });
    }

    // Formater les questions avec alternance aléatoire audio/paroles
    const questions = chansons.map(chanson => {
      // Décider aléatoirement : true = audio, false = paroles
      const showAudio = Math.random() < 0.5;
      
      return {
        id: chanson.id,
        hintType: showAudio ? 'audio' : 'lyrics',
        audioUrl: showAudio ? chanson.url_audio : null,
        paroles: !showAudio ? chanson.paroles : null,
        reponses: {
          chanson: chanson.titre,
          artiste: chanson.artist,
          album: chanson.album_title
        },
        infos: {
          albumId: chanson.album_id,
          coverUrl: chanson.cover_url,
          releaseYear: chanson.release_year,
          genre: chanson.genre
        }
      };
    });

    res.json(questions);
  });
});

// GET /blindtest/suggestions - Pour l'autocomplétion
router.get('/suggestions', (req, res) => {
  // Récupérer tous les titres de chansons
  db.query('SELECT DISTINCT titre FROM chansons', (err1, chansons) => {
    if (err1) {
      console.error('Erreur suggestions:', err1);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    // Récupérer tous les artistes
    db.query('SELECT DISTINCT artist FROM albums', (err2, artistes) => {
      if (err2) {
        console.error('Erreur suggestions:', err2);
        return res.status(500).json({ error: 'Erreur serveur' });
      }

      // Récupérer tous les albums
      db.query('SELECT DISTINCT title FROM albums', (err3, albums) => {
        if (err3) {
          console.error('Erreur suggestions:', err3);
          return res.status(500).json({ error: 'Erreur serveur' });
        }

        res.json({
          chansons: chansons.map(c => c.titre),
          artistes: artistes.map(a => a.artist),
          albums: albums.map(a => a.title)
        });
      });
    });
  });
});

module.exports = router;
