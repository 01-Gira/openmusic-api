require('dotenv').config();
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const NotFoundError = require('../exceptions/NotFoundError');
const InvariantError = require('../exceptions/InvariantError');

class PlaylistSongsService {
  constructor(songsService) {
    this._pool = new Pool();

    this._songsService = songsService;
  }

  /**
   * Method untuk menambahkan song ke playlist ke database
   * @param {string} songId - Song ID
   * @param {string} playlistId - User ID
   * @returns {Promise<string>} - Mengembalikan ID song playlist yang baru ditambahkan
   */
  async addPlaylistSong(playlistId, credentialId, { songId }) {
    await this._songsService.getSongById(songId);

    const id = `playlist_song-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_songs (id, "songId", "playlistId") VALUES($1, $2, $3) RETURNING id',
      values: [id, songId, playlistId]
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new Error('Song gagal ditambahkan ke playlist');
    }

    await this.addPlaylistActivities(songId, playlistId, credentialId, 'add');
    return result.rows[0].id;
  }

  /**
   * Method untuk mendapatkan playlist berdasarkan ID
   * @param {string} id - ID playlist
   * @returns {Promise<Object>} - Mengembalikan detail playlist
   */
  async getPlaylistSongs(id, userId) {
    const query = {
      text: `SELECT p.id, p.name, u.username,
              COALESCE(
                  json_agg(
                      json_build_object(
                          'id', s.id,
                          'title', s.title,
                          'performer', s.performer
                      )
                  ) FILTER (WHERE ps.id IS NOT NULL), '[]'
              ) AS songs
        FROM playlists p 
        LEFT JOIN playlist_songs ps ON p.id = ps."playlistId"
        LEFT JOIN songs s ON ps."songId" = s.id 
        LEFT JOIN playlist_collaborations pc ON p.id = pc."playlistId"
        JOIN users u ON p."userId" = u.id
        WHERE p.id = $1 
          AND (p."userId" = $2 OR pc."userId" = $2)
        GROUP BY p.id, u.username`,
      values: [id, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    return result.rows[0];
  }

  async deletePlaylistSong(playlistId, credentialId, { songId }) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE "songId" = $1 RETURNING id',
      values: [songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song gagal dihapus dari playlist');
    }

    await this.addPlaylistActivities(songId, playlistId, credentialId, 'delete');
  }

  /**
     * Method untuk menambahkan playlist actvities ke database
     * @param {string} songId - Song ID playlist actvities
     * @param {string} playlistId - Playlist ID playlist actvities
     * @param {string} credentialId - User ID playlist actvities
     * @param {string} action - Action playlist actvities
     * @returns {Promise<string>} - Mengembalikan response
     */
  async addPlaylistActivities(songId, playlistId, credentialId, action) {
    const id = `playlist_activities-${nanoid(16)}`; // Membuat ID unik dengan nanoid
    const time = new Date().toISOString();
    const query = {
      text: 'INSERT INTO playlist_activities (id, "songId", "playlistId", "userId", action, time) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, songId, playlistId, credentialId, action, time],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new Error('Playlist activities gagal ditambahkan');
    }

  }
}

module.exports = PlaylistSongsService;