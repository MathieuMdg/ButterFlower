const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./config/db');
const userRoutes = require('./routes/users');
const albumRoutes = require('./routes/albums');
const reviewRoutes = require('./routes/reviews');
const chansonRoutes = require('./routes/chansons');
const blindtestRoutes = require('./routes/blindtest');
const app = express();

const session = require('express-session');
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(cors({
  origin: 'http://localhost:8081',
  credentials: true
}));
app.use(bodyParser.json());
app.use(express.json());
app.use('/api/reviews', reviewRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chansons', chansonRoutes);
app.use('/api/blindtest', blindtestRoutes);

app.get('/', (req, res) => {
  res.send('Hello ButterFlower!');
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
