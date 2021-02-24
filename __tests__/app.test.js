require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;

    beforeAll(async done => {
      execSync('npm run setup-db');

      client.connect();

      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });

      token = signInData.body.token; // eslint-disable-line

      return done();
    });

    afterAll(done => {
      return client.end(done);
    });

    test('returns board_games', async () => {

      const expectation = [
        {
          name: 'Rummikub',
          max_players: 4,
          min_players: 2,
          expansion: false,
          category_id: 1,
          owner_id: 1,
          id: 1,
          category: 'tile',
        },
        {
          name: 'Catan: Seafarers',
          max_players: 4,
          min_players: 3,
          expansion: true,
          category_id: 2,
          owner_id: 1,
          id: 2,
          category: 'trading',
        },
        {
          name: 'Codenames',
          max_players: 8,
          min_players: 2,
          expansion: false,
          category_id: 3,
          owner_id: 1,
          id: 3,
          category: 'word',
        },
      ];

      const data = await fakeRequest(app)
        .get('/board_games')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('returns board_games item with matching id', async () => {

      const expectation = {
        name: 'Codenames',
        max_players: 8,
        min_players: 2,
        expansion: false,
        category_id: 3,
        owner_id: 1,
        id: 3,
        category: 'word',
      }

      const data = await fakeRequest(app)
        .get('/board_games/3')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('delete board_games item with matching id', async () => {

      const expectation = {
        name: 'Codenames',
        max_players: 8,
        min_players: 2,
        expansion: false,
        category_id: 3,
        owner_id: 1,
        id: 3,
      }

      const data = await fakeRequest(app)
        .delete('/board_games/3')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('post item to board_games', async () => {

      const addedGame = {
        name: 'Codenames',
        max_players: 8,
        min_players: 2,
        expansion: false,
        category_id: 3,
      };

      const expectation = {
        ...addedGame,
        owner_id: 1,
        id: 4,
      };

      const data = await fakeRequest(app)
        .post('/board_games')
        .send(addedGame)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);

      const expectationTwo = {
        ...addedGame,
        owner_id: 1,
        id: 4,
        category: 'word',
      };

      const storedGames = await fakeRequest(app)
        .get('/board_games')
        .expect('Content-Type', /json/)
        .expect(200);

      const newGame = storedGames.body.find(game => game.name === addedGame.name);

      expect(newGame).toEqual(expectationTwo);
    });

    test('updates board_games item with matching id', async () => {

      const updatedGame = {
        name: 'Duck Duck Goose',
        max_players: 42,
        min_players: 3,
        expansion: false,
        category_id: 7,
        category: 'trickery',
      };

      const expectation = {
        ...updatedGame,
        owner_id: 1,
        id: 2
      };

      await fakeRequest(app)
        .put('/board_games/2')
        .send(updatedGame)
        .expect('Content-Type', /json/)
        .expect(200);

      const data = await fakeRequest(app)
        .get('/board_games/2')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('returns board_games', async () => {

      const expectation = [
        {
          category: 'tile',
          id: 1,
        },
        {
          category: 'trading',
          id: 2,
        },
        {
          category: 'word',
          id: 3,
        },
        {
          category: 'strategy',
          id: 4,
        },
        {
          category: 'co-op',
          id: 5,
        },
        {
          category: 'trivia',
          id: 6,
        },
        {
          category: 'trickery',
          id: 7,
        },
      ];

      const data = await fakeRequest(app)
        .get('/categories')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

  });
});
