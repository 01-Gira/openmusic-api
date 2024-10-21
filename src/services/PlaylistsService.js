require('dotenv').config();
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const NotFoundError = require('../exceptions/NotFoundError');
const InvariantError = require('../exceptions/InvariantError');
const AuthorizationError = require('../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(collaborationService) {
    this._pool = new Pool();
    this._collaborationService = collaborationService;
  }

  /**
   * Method untuk menambahkan playlist ke database
   * @param {string} title - Nama playlist
   * @param {string} userId - User ID playlist
   * @returns {Promise<string>} - Mengembalikan ID playlist yang baru ditambahkan
   */
  async addPlaylist({ name, credentialId }) {
    console.log(credentialId);
    const id = `playlist-${nanoid(16)}`; // Membuat ID unik dengan nanoid
    const query = {
      text: 'INSERT INTO playlists (id, name, "userId") VALUES($1, $2, $3) RETURNING id',
      values: [id, name, credentialId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new Error('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  /**
   * Method untuk mendapatkan playlist berdasarkan ID
   * @param {string} id - ID playlist
   * @returns {Promise<Object>} - Mengembalikan detail playlist
   */
  async getPlaylistById(id, credentialId) {
    const query = {
      text: `SELECT p.*,
      COALESCE(
	        json_agg(
	            json_build_object(
	                'id', s.id,
	                'title', s.title,
	                'performer', s.performer
	            )
	        ) FILTER (WHERE ps.id IS NOT NULL), '[]'
	    ) AS songs
      FROM playlists p LEFT JOIN playlist_songs ps ON p.id = ps."playlistId"
      LEFT JOIN songs s on ps."songId" = s.id 
      LEFT JOIN playlist_colloborators pc on p.id = pc."playlistId"
      where p.id = $1 AND p."userId" = $2 or pc."userId" $2 
      group by p.id`,
      values: [id, credentialId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Playlist tidak ditemukan');
    }

    const album = result.rows[0];
    album.year = Number(album.year);

    return result.rows[0];
  }

  /**
   * Method untuk mendapatkan semua playlist berdasarkan ID User
   * @param {string} credentialId - ID User playlist
   * @returns {Promise<Object>} - Mengembalikan detail playlists
   */
  async getPlaylists(credentialId) {
    const query = {
      text: `SELECT p.id, p.name, u.username 
      FROM playlists p 
      JOIN users u ON p."userId" = u.id 
      LEFT JOIN playlist_collaborations pc ON p.id = pc."playlistId"
      WHERE p."userId" = $1 OR pc."userId" = $1`,
      values: [credentialId]
    };

    const result = await this._pool.query(query);

    return result.rows;
  }
  /**
   * Method untuk menghapus playlist berdasarkan ID
   * @param {string} id - ID playlist
   * @returns {Promise<void>}
   */
  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Playlist gagal dihapus. ID tidak ditemukan');
    }
  }

  /**
   * Method untuk mengupdate data playlist
   * @param {string} id - ID playlist
   * @param {string} name - Nama playlist
   * @returns {Promise<void>} Mengembalikan ID playlist yang baru diupdate
   */
  async editPlaylistById(id, { name }) {
    const query = {
      text: 'UPDATE playlists SET name = $1 WHERE id = $2 RETURNING id',
      values: [name, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui playlist. ID tidak ditemukan');
    }
  }

  /**
   * Method untuk memverifikasi access ke playlist ke database
   * @param {string} playlistId - Playlist ID playlist
   * @param {string} userId - User ID playlist
   * @returns {Promise<string>} - Mengembalikan response
   */
  async verifyPlaylistAccess(playlistId, userId){
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationService.verifyCollabolator(playlistId, userId);
      } catch (collaboratorError) {
        console.log(collaboratorError);
        throw error;

      }
    }
  }

  /**
     * Method untuk memverifikasi access ke playlist ke database
     * @param {string} id - Playlist ID playlist
     * @param {string} userId - User ID playlist
     * @returns {Promise<string>} - Mengembalikan response
     */
  async verifyPlaylistOwner(id, userId) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];

    if (playlist.userId !== userId) {
      throw new AuthorizationError('Anda tidak berhak mengakses playlist ini');
    }
  }

  /**
   * Method untuk mendapatkan semua playlist berdasarkan ID User
   * @param {string} playlistId - ID Playlist playlist activities
   * @returns {Promise<Object>} - Mengembalikan detail playlists
   */
  async getPlaylistActivities(playlistId) {
    const query = {
      text: `SELECT u.username, s.title, pa.action, pa.time from playlist_activities pa 
      JOIN users u ON pa."userId" = u.id 
      JOIN songs s ON pa."songId" = s.id
      WHERE pa."playlistId" = $1 `,
      values: [playlistId]
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

}

module.exports = PlaylistsService;