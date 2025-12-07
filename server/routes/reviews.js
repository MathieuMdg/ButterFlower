const express = require('express');
const router = express.Router();
const reviewModel = require('../models/reviewModel');
const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');

router.get('/album/:albumId', (req, res) => {
  reviewModel.getReviewsByAlbum(req.params.albumId, (err, rows) => {
    if (err) return res.status(500).send('Erreur serveur');
    res.json(rows);
  });
});
router.get('/user/:userId', (req, res) => {
  reviewModel.getReviewsByUser(req.params.userId, (err, rows) => {
    if (err) return res.status(500).send('Erreur serveur');
    res.json(rows);
  });
});

router.get('/user/:id', (req, res) => {
  reviewModel.getReviewsByUser(req.params.id, (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.json(results);
  });
});

router.post('/', (req, res) => {
  const { user_id, album_id, rating, review_text } = req.body;

  userModel.findUserById(user_id, (err, user) => {
    if (err || !user) return res.status(401).json({ error: 'Utilisateur inconnu' });

    if (!user.can_comment && review_text && review_text.trim() !== '') {
      return res.status(403).json({ error: 'Vous ne pouvez pas laisser de commentaire.' });
    }
    reviewModel.createReview(req.body, (err, result) => {
      if (err) return res.status(500).send('Erreur BDD');
      res.status(201).send('Review créée');
    });
  });
});

router.put('/:id', (req, res) => {
  reviewModel.updateReview(req.params.id, req.body, (err, result) => {
    if (err) return res.status(500).send('Erreur serveur');
    res.send('Review modifiée');
  });
});

router.delete('/:id', (req, res) => {
  reviewModel.deleteReview(req.params.id, (err, result) => {
    if (err) return res.status(500).send('Erreur serveur');
    res.send('Review supprimée');
  });
});

function isAdmin(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(403).json({ error: 'Non autorisé' });
  try {
    const payload = jwt.verify(token, 'secret');
    if (payload.role === 'admin') next();
    else res.status(403).json({ error: 'Non autorisé' });
  } catch {
    res.status(401).json({ error: 'Token invalide' });
  }
}

module.exports = router;
