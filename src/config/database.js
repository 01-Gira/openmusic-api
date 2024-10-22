const { Pool } = require('pg');
const config = require('../utils/config');

const pool = new Pool({
  user: config.postgres.pgUser,
  host: config.postgres.pgHost,
  database: config.postgres.pgDatabase,
  password: config.postgres.pgPassword,
  port: config.postgres.pgPassword,
});

module.exports = pool;
