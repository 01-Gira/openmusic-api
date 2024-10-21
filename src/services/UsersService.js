require('dotenv').config();
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const NotFoundError = require('../exceptions/NotFoundError');
const InvariantError = require('../exceptions/InvariantError');
const AuthenticationError = require('../exceptions/AuthenticationError');

class UsersService {
  constructor() {
    this._pool = new Pool();
  }

  /**
   * Method untuk menambahkan user ke database
   * @param {string} username - Username user
   * @param {string} password - Password user
   * @param {string} fullname - Fullname user
   * @returns {Promise<string>} - Mengembalikan ID user yang baru ditambahkan
   */
  async addUser({ username, password, fullname }) {
    await this.verifyNewUsername(username);

    const id = `user-${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = {
      text: 'INSERT INTO users (id, username, password, fullname) VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, username, hashedPassword, fullname],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new Error('User gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  /**
   * Method untuk menverifikasi Username yang baru
   * @param {string} username - Username user
   * @returns {Promise<string>} - Mengembalikan status verifikasi username yang baru
   */
  async verifyNewUsername(username){
    const query = {
      text: 'SELECT FROM users WHERE username = $1',
      values: [username]
    };

    const result = await this._pool.query(query);

    if (result.rows.length > 0){
      throw new InvariantError('Gagal menambahkan user. Username sudah digunakan');
    }
  }

  /**
   * Method untuk mendapatkan user berdasarkan ID
   * @param {string} id - ID user
   * @returns {Promise<Object>} - Mengembalikan detail user
   */
  async getUserById(id) {
    const query = {
      text: 'SELECT id, username, fullname from users where id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('User tidak ditemukan');
    }

    return result.rows[0];
  }

  /**
   * Method untuk memverifikasi user berdasarkan username dan password
   * @param {string} username - Username user
   * @param {string} password - Password user
   * @returns {Promise<Object>} - Mengembalikan detail user
   */
  async verifyUserCredential(username, password) {
    const query = {
      text: 'SELECT id, password FROM users WHERE username = $1',
      values: [username],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah');
    }

    const { id, password: hashedPassword } = result.rows[0];

    const match = await bcrypt.compare(password, hashedPassword);

    if (!match) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah');
    }

    return id;
  }
}

module.exports = UsersService;