const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  /**
       * Method untuk menambahkan song ke database
       * @param {string} title - Title song
       * @param {string} genre - Genre song
       * @param {string} performer - Performer song
       * @param {number} duration - Duration song
       * @param {string} albumId - ID Album song
       * @returns {Promise<string>} - Mengembalikan ID song yang baru ditambahkan
       */
  async addSong({ title, genre, performer, duration, year, albumId }) {
    const id = `song-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO songs (id, title, genre, performer, duration, year, "albumId") VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, genre, performer, duration, year, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new NotFoundError('Lagu gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  /**
   * Method untuk mendapatkan song berdasarkan ID
   * @param {string} id - ID song
   * @returns {Promise<Object>} - Mengembalikan detail song
   */
  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Song tidak ditemukan');
    }

    const song = result.rows[0];

    song.year = Number(song.year);

    return result.rows[0];
  }

  /**
   * Method untuk mendapatkan semua song
   * @returns {Promise<Object>} - Mengembalikan detail album
   */
  async getSongs(title, performer) {
    const query = {
      text: 'SELECT id, title, performer FROM songs WHERE 1=1',
      values: [],
    };

    if (title) {
      query.text += ` AND LOWER(title) LIKE '%' || LOWER($${query.values.length + 1}) || '%'`;
      query.values.push(title);
    }

    if (performer) {
      query.text += ` AND LOWER(performer) LIKE '%' || LOWER($${query.values.length + 1}) || '%'`;
      query.values.push(performer);
    }

    const result = await this._pool.query(query);
    return result.rows;
  }
  /**
       * Method untuk menghapus song berdasarkan ID
       * @param {string} id - ID Song
       * @returns {Promise<void>}
       */
  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Song gagal dihapus. ID tidak ditemukan');
    }
  }

  /**
       * Method untuk mengupdate data album
       * @param {string} id - ID album
       * @param {string} title - Title song
       * @param {string} genre - Genre song
       * @param {string} performer - Performer song
       * @param {number} duration - Duration song
       * @param {string} albumId - ID Album song
       * @returns {Promise<void>}
       */
  async editSongById(id, { title, genre, performer, duration, year, albumId }) {
    const query = {
      text: 'UPDATE songs SET title = $1, genre = $2, performer = $3, duration = $4, year = $5, "albumId" = $6 WHERE id = $7 RETURNING id',
      values: [title, genre, performer, duration, year, albumId, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui album. ID tidak ditemukan');
    }
  }
}

module.exports = SongsService;