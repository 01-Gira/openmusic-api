require('dotenv').config();
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const NotFoundError = require('../exceptions/NotFoundError');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  /**
   * Method untuk menambahkan album ke database
   * @param {string} name - Nama album
   * @param {number} year - Tahun album
   * @returns {Promise<string>} - Mengembalikan ID album yang baru ditambahkan
   */
  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`; // Membuat ID unik dengan nanoid
    const query = {
      text: 'INSERT INTO albums (id, name, year) VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new Error('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  /**
   * Method untuk mendapatkan album berdasarkan ID
   * @param {string} id - ID album
   * @returns {Promise<Object>} - Mengembalikan detail album
   */
  async getAlbumById(id) {
    const query = {
      text: `SELECT a.*,
      COALESCE(
          json_agg(
              json_build_object(
                  'id', b.id,
                  'title', b.title,
                  'performer', b.performer
              )
          ) FILTER (WHERE b.id IS NOT NULL), '[]'
      ) AS songs
      FROM albums a LEFT JOIN songs b ON a.id = b."albumId" WHERE a.id = $1 group by a.id`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const album = result.rows[0];
    album.year = Number(album.year);

    return result.rows[0];
  }

  /**
   * Method untuk mendapatkan album berdasarkan ID
   * @param {string} id - ID album
   * @returns {Promise<Object>} - Mengembalikan detail album
   */
  async getAlbums() {
    const query = {
      // eslint-disable-next-line quotes
      text: `SELECT a.*,
      COALESCE(
          json_agg(
              json_build_object(
                  'id', b.id,
                  'title', b.title,
                  'performer', b.performer
              )
          ) FILTER (WHERE b.id IS NOT NULL), '[]'
      ) AS songs
      FROM albums a LEFT JOIN songs b ON a.id = b."albumId" group by a.id
      `,
    };

    const result = await this._pool.query(query);

    return result.rows;
  }
  /**
   * Method untuk menghapus album berdasarkan ID
   * @param {string} id - ID album
   * @returns {Promise<void>}
   */
  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus. ID tidak ditemukan');
    }
  }

  /**
   * Method untuk mengupdate data album
   * @param {string} id - ID album
   * @param {string} name - Nama album
   * @param {number} year - Tahun album
   * @returns {Promise<void>}
   */
  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. ID tidak ditemukan');
    }
  }
}

module.exports = AlbumsService;