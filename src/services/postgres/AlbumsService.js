const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const NotFoundError = require('../../exceptions/NotFoundError');
const InvariantError = require('../../exceptions/InvariantError');

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  /**
   * Method untuk menambahkan album ke database
   * @param {string} name - Nama album
   * @param {number} year - Tahun album
   * @returns {Promise<string>} - Mengembalikan ID album yang baru ditambahkan
   */
  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
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

    if (!result.rowCount) {
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
      text: `SELECT a.* FROM albums a
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

    if (!result.rowCount) {
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

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui album. ID tidak ditemukan');
    }
  }

  /**
   * Method untuk mengupdate cover album
   * @param {string} id - ID album
   * @param {string} coverUrl - Cover URL album
   * @returns {Promise<void>}
   */
  async editCoverAlbumById(id, coverUrl) {
    const query = {
      text: 'UPDATE albums SET "coverUrl" = $1 WHERE id = $2 RETURNING id',
      values: [coverUrl, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui cover album. ID tidak ditemukan');
    }
  }

  /**
   * Method untuk mendapatkan album likes
   * @param {string} id - ID album
   * @returns {Promise<void>}
   */
  async getAlbumLikes(id) {
    const resultCache = await this._cacheService.get(`album_likes:${id}`);

    if (resultCache) {
      return { source: 'cache', data: JSON.parse(result) };
    }

    const query = {
      text: 'SELECT COUNT(id) as likes FROM album_likes WHERE "albumId" = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('ID tidak ditemukan');
    }

    result.rows[0].likes = Number(result.rows[0].likes);

    await this._cacheService.set(`album_likes:${id}`, JSON.stringify(result.rows[0]));

    return result.rows[0];
  }

  /**
   * Method untuk menambahkan album likes
   * @param {string} albumId - ID album
   * @param {string} credentialId - User ID
   * @returns {Promise<void>}
   */
  async addAlbumLike(albumId, credentialId) {
    const checkQuery = {
      text: 'SELECT * FROM album_likes WHERE "albumId" = $1 AND "userId" = $2',
      values: [albumId, credentialId],
    };

    const checkResult = await this._pool.query(checkQuery);

    if (checkResult.rowCount > 0) {
      throw new InvariantError('Anda sudah menyukai album ini');
    }

    const id = `album_likes-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO album_likes (id, "albumId", "userId") VALUES($1, $2, $3) RETURNING id',
      values: [id, albumId, credentialId]
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id){
      throw new InvariantError('Album gagal ditambahkan');
    }

    await this._cacheService.delete(`album_likes:${albumId}`);

    return result.rows[0].id;
  }

  /**
   * Method untuk mendelete album likes
   * @param {string} albumId - ID album
   * @param {string} credentialId - User ID
   * @returns {Promise<void>}
   */
  async deleteAlbumLike(albumId, credentialId) {
    const query = {
      text: 'DELETE FROM album_likes WHERE "albumId" = $1 AND "userId" = $2 RETURNING id',
      values: [albumId, credentialId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount){
      throw new InvariantError('Gagal menghapus like pada album ini.');
    }

    await this._cacheService.delete(`album_likes:${albumId}`);
  }
}

module.exports = AlbumsService;