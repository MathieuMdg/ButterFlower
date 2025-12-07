const express = require('express');
const router = express.Router();
const db = require('../config/db');
const axios = require('axios');

router.get('/questions', (req, res) => {
  const query = `
    SELECT 
      c.id,
      c.titre,
      c.deezer_preview_url,
      c.paroles,
      a.id AS album_id,
      a.title AS album_title,
      a.artist,
      a.cover_url,
      a.release_year,
      a.genre
    FROM chansons c
    JOIN albums a ON c.album_id = a.id
    WHERE c.deezer_preview_url IS NOT NULL AND c.deezer_preview_url != ''
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

    const questions = chansons.map(chanson => {
      let showAudio = Math.random() < 0.5;
      if (!chanson.paroles) showAudio = true;

      return {
        id: chanson.id,
        hintType: showAudio ? 'audio' : 'lyrics',

        audioUrl: showAudio ? `/api/blindtest/audio-proxy/${chanson.id}` : null,
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

router.get('/suggestions', (req, res) => {
  db.query('SELECT DISTINCT titre FROM chansons', (err1, chansons) => {
    if (err1) {
      console.error('Erreur suggestions:', err1);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    db.query('SELECT DISTINCT artist FROM albums', (err2, artistes) => {
      if (err2) {
        console.error('Erreur suggestions:', err2);
        return res.status(500).json({ error: 'Erreur serveur' });
      }

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

router.get('/audio-proxy/:trackId', async (req, res) => {
  const { trackId } = req.params;
  
  try {
    db.query(
      'SELECT deezer_id FROM chansons WHERE id = ?', 
      [trackId], 
      async (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (results.length === 0) {
          return res.status(404).json({ error: 'Track not found' });
        }

        const deezerId = results[0].deezer_id;
        
        if (!deezerId) {
          return res.status(404).json({ error: 'No Deezer ID' });
        }

        try {
        
          const deezerResponse = await axios.get(`https://api.deezer.com/track/${deezerId}`);
          const previewUrl = deezerResponse.data.preview;

          if (!previewUrl) {
            return res.status(404).json({ error: 'No preview available' });
          }

          const audioResponse = await axios({
            method: 'get',
            url: previewUrl,
            responseType: 'stream',
            timeout: 10000
          });

          res.set({
            'Content-Type': audioResponse.headers['content-type'] || 'audio/mpeg',
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'public, max-age=300'
          });

          audioResponse.data.pipe(res);

        } catch (deezerError) {
          console.error(`Deezer API error for track ${deezerId}:`, deezerError.message);
          return res.status(500).json({ error: 'Failed to fetch from Deezer' });
        }
      }
    );
  } catch (error) {
    console.error('Proxy audio error:', error.message);
    res.status(500).json({ error: 'Failed to fetch audio' });
  }
});

module.exports = router;
