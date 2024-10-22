const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const NotFoundError = require('../../exceptions/NotFoundError');

class CollaborationsService {
  constructor() {
    this._pool = new Pool();
  }

  /**
   * Method untuk memverifikasi playlist collaborator
   * @param {string} playlistId - Playlist ID playlist collaboration
   * @param {string} userId - User ID playlist collaboration
   * @returns {Promise<string>} - Mengembalikan ID playlist collaboration yang baru ditambahkan
   */
  async verifyCollabolator(playlistId, userId){
    console.log(userId);
    const query = {
      text: 'SELECT * FROM playlist_collaborations WHERE "playlistId" = $1 AND "userId" = $2',
      values: [playlistId, userId]
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].userId){
      throw new AuthorizationError('Anda tidak mempunyai akses!');
    }
  }

  /**
   * Method untuk menambahkan playlist collaborator ke database
   * @param {string} playlistId - Playlist ID playlist collaboration
   * @param {string} userId - User ID playlist collaboration
   * @returns {Promise<string>} - Mengembalikan ID playlist collaboration yang baru ditambahkan
   */
  async addCollaboration(playlistId, userId) {
    const checkUserQuery = {
      text: 'SELECT id FROM users WHERE id = $1',
      values: [userId],
    };
    const userResult = await this._pool.query(checkUserQuery);

    if (userResult.rowCount === 0) {
      throw new NotFoundError('User tidak ditemukan');
    }

    const id = `playlist_collaboration-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_collaborations (id, "playlistId", "userId") VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist Collaboration gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  /**
   * Method untuk menghapus playlist collaborator berdasarkan ID
   * @param {string} id - ID playlist
   * @returns {Promise<void>}
   */
  async deleteCollaborationById(playlistId, userId) {
    const query = {
      text: 'DELETE FROM playlist_collaborations WHERE "playlistId" = $1 AND "userId" = $2 RETURNING id',
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist Collaboration gagal dihapus. ID tidak ditemukan');
    }
  }
}

module.exports = CollaborationsService;