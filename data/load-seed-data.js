const client = require('../lib/client');
// import our seed data:
const board_games = require('./board-games.js');
const categories = require('./categories.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
          [user.email, user.hash]);
      })
    );

    const user = users[0].rows[0];

    await Promise.all(
      categories.map(category => {
        return client.query(`
                      INSERT INTO categories (category)
                      VALUES ($1)
                      RETURNING *;
                  `,
          [category.category]);
      })
    );

    await Promise.all(
      board_games.map(game => {
        return client.query(`
                    INSERT INTO board_games (name, max_players, min_players, expansion, category_id, owner_id)
                    VALUES ($1, $2, $3, $4, $5, $6);
                `,
          [game.name, game.max_players, game.min_players, game.expansion, game.category_id, user.id]);
      })
    );


    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch (err) {
    console.log(err);
  }
  finally {
    client.end();
  }

}
