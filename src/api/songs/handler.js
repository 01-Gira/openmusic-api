const ClientError = require('../../exceptions/ClientError');

class SongsHandler {
  constructor(songsService, validator) {
    this._songsService = songsService;
    this._validator = validator;

    this.postSongHandler = this.postSongHandler.bind(this);
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
    this.getSongsHandler = this.getSongsHandler.bind(this);
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
  }

  /**
     * Handler untuk menambahkan song
     * @param {Object} request - Request object dari Hapi.js
     * @param {Object} h - Response toolkit dari Hapi.js
     * @returns {Promise<ResponseObject>}
     */
  async postSongHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload);
      const { title, genre, performer, duration, year, albumId } = request.payload;

      const songId = await this._songsService.addSong({ title, genre, performer, duration, year, albumId });

      return h.response({
        status: 'success',
        message: 'Song berhasil ditambahkan',
        data: {
          songId,
        },
      }).code(201);
    } catch (error) {
      if (error instanceof ClientError) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(error.statusCode);
      }

      return h.response({
        status: 'error',
        message: `Maaf, terjadi kegagalan pada server kami ${  error.message}`,
      }).code(500);
    }
  }

  /**
     * Handler untuk mendapatkan song berdasarkan ID
     * @param {Object} request - Request object dari Hapi.js
     * @param {Object} h - Response toolkit dari Hapi.js
     * @returns {Promise<ResponseObject>}
     */
  async getSongByIdHandler(request, h) {
    try {
      const { id } = request.params;
      await this._validator.validateQuery({ id });
      const song = await this._songsService.getSongById(id);

      return h.response({
        status: 'success',
        data: {
          song,
        },
      }).code(200);
    } catch (error) {
      if (error instanceof ClientError) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(error.statusCode);
      }

      return h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      }).code(500);
    }
  }

  /**
     * Handler untuk mendapatkan songs
     * @param {Object} request - Request object dari Hapi.js
     * @param {Object} h - Response toolkit dari Hapi.js
     * @returns {Promise<ResponseObject>}
     */
  async getSongsHandler(request, h) {
    try {
      this._validator.validateQuery(request.query);
      const { title, performer } = request.query;
      const songs = await this._songsService.getSongs(title, performer);
      return h.response({
        status: 'success',
        data: {
          songs,
        },
      }).code(200);
    } catch (error) {
      if (error instanceof ClientError) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(error.statusCode);
      }

      return h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      }).code(500);
    }
  }

  /**
     * Handler untuk memperbarui song berdasarkan ID
     * @param {Object} request - Request object dari Hapi.js
     * @param {Object} h - Response toolkit dari Hapi.js
     * @returns {Promise<ResponseObject>}
     */
  async putSongByIdHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload);
      const { id } = request.params;
      const { title, genre, performer, duration, year, albumId } = request.payload;

      await this._songsService.editSongById(id, { title, genre, performer, duration, year, albumId });

      return h.response({
        status: 'success',
        message: 'Song berhasil diperbarui',
      }).code(200);
    } catch (error) {
      if (error instanceof ClientError) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(error.statusCode);
      }

      return h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      }).code(500);
    }
  }

  /**
     * Handler untuk menghapus song berdasarkan ID
     * @param {Object} request - Request object dari Hapi.js
     * @param {Object} h - Response toolkit dari Hapi.js
     * @returns {Promise<ResponseObject>}
     */
  async deleteSongByIdHandler(request, h) {
    try {
      const { id } = request.params;

      await this._songsService.deleteSongById(id);

      return h.response({
        status: 'success',
        message: 'Song berhasil dihapus',
      }).code(200);
    } catch (error) {
      if (error instanceof ClientError) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(error.statusCode);
      }

      return h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      }).code(500);
    }
  }
}

module.exports = SongsHandler;
