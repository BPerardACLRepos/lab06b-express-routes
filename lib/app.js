const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/categories', async (req, res) => {
  try {
    const data = await client.query(
      'SELECT * FROM categories');

    res.json(data.rows);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

app.get('/board_games', async (req, res) => {
  try {
    const data = await client.query(
      'SELECT * FROM board_games');

    res.json(data.rows);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

app.get('/board_games/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = await client.query(
      'SELECT * FROM board_games WHERE id=$1',
      [id]);

    res.json(data.rows[0]);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

app.delete('/board_games/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = await client.query(
      'DELETE FROM board_games WHERE id=$1 returning *',
      [id]);

    res.json(data.rows[0]);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

app.post('/board_games', async (req, res) => {
  try {
    const data = await client.query(
      `INSERT INTO board_games 
      (name, max_players, min_players, expansion, category_id, owner_id) 
      values ($1, $2, $3, $4, $5, $6)
      returning *`,
      [
        req.body.name,
        req.body.max_players,
        req.body.min_players,
        req.body.expansion,
        req.body.category_id,
        1
      ]);

    res.json(data.rows[0]);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

app.put('/board_games/:id', async (req, res) => {

  const id = req.params.id;

  try {
    const data = await client.query(`
      UPDATE board_games
      SET name = $1, max_players = $2, min_players = $3, expansion = $4, category_id = $5 
      WHERE id=$6
      returning *;`,
      [
        req.body.name,
        req.body.max_players,
        req.body.min_players,
        req.body.expansion,
        req.body.category_id,
        id,
      ]);

    res.json(data.rows[0]);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
