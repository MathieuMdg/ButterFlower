const express = require('express');
const router = express.Router();
const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

function isAdmin(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(403).json({error: 'Non autorisé'});
  try {
    const payload = jwt.verify(token, 'secret');
    if (payload.role === 'admin') next();
    else res.status(403).json({error: 'Non autorisé'});
  } catch {
    res.status(401).json({ error: 'Token invalide' });
  }
}

router.get('/', isAdmin, (req, res) => {
  userModel.getAllUsers((err, users) => {
    if (err) return res.status(500).json({error: 'Erreur serveur'});
    res.json(users);
  });
});

router.post('/register', (req, res) => {
  const { username, email, password, role } = req.body;
  userModel.findUserByEmail(email, (err, results) => {
    if (results && results.length) {
      return res.status(400).send('Email déjà utilisé');
    }
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) return res.status(500).send('Erreur serveur');
      userModel.createUser({ username, email, password: hash, role: role || 'user' }, (err, result) => {
        if (err) return res.status(500).send('Erreur base');
        res.status(201).send('Utilisateur créé');
      });
    });
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  userModel.findUserByEmail(email, (err, results) => {
    if (err || !results.length) {
      return res.status(401).send('Email ou mot de passe incorrect');
    }
    const user = results[0];
    bcrypt.compare(password, user.password, (err, valid) => {
      if (valid) {
        req.session.userId = user.id;
        req.session.role = user.role;
        req.session.username = user.username;

        const token = jwt.sign(
          { id: user.id, username: user.username, role: user.role },
          'secret',
          { expiresIn: '5h' }
        );

        return res.json({
          message: 'Connexion réussie',
          userId: user.id,
          username: user.username,
          role: user.role,
          token 
        });
      } else {
        res.status(401).send('Email ou mot de passe incorrect');
      }
    });
  });
});


router.post('/logout', (req, res) => {
  req.session.destroy();
  res.send('Déconnexion réussie');
});


router.get('/me', (req, res) => {

  const token = req.query.token;
  if (!token) return res.status(401).json({ error: 'Token manquant' });
  try {
    const payload = jwt.verify(token, 'secret');
    userModel.findUserById(payload.id, (err, user) => {
      if (err || !user) return res.status(404).json({ error: 'User inconnu' });
      res.json({
        id: user.id,
        username: user.username,
        role: user.role,
        can_comment: user.can_comment
      });
    });
  } catch {
    res.status(401).json({ error: 'Token invalide' });
  }
});

router.put('/:id/block-comments', isAdmin, (req, res) => {
  userModel.setCanComment(req.params.id, false, (err) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.json({ success: true });
  });
});

router.put('/:id/unblock-comments', isAdmin, (req, res) => {
  userModel.setCanComment(req.params.id, true, (err) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.json({ success: true });
  });
});

module.exports = router;
