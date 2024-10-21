const ClientError = require('../../exceptions/ClientError');

class AlbumsHandler {
  constructor(albumsService, validator) {
    this._albumsService = albumsService;
    this._validator = validator;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.getAlbumsHandler = this.getAlbumsHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
  }

  /**
     * Handler untuk menambahkan album
     * @param {Object} request - Request object dari Hapi.js
     * @param {Object} h - Response toolkit dari Hapi.js
     * @returns {Promise<ResponseObject>}
     */
  async postAlbumHandler(request, h) {
    try {
      this._validator.validateAlbumPayload(request.payload);
      const { name, year } = request.payload;

      const albumId = await this._albumsService.addAlbum({ name, year });

      return h.response({
        status: 'success',
        message: 'Album berhasil ditambahkan',
        data: {
          albumId,
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
        message: 'Maaf, terjadi kegagalan pada server kami.',
      }).code(500);
    }
  }

  /**
     * Handler untuk mendapatkan album berdasarkan ID
     * @param {Object} request - Request object dari Hapi.js
     * @param {Object} h - Response toolkit dari Hapi.js
     * @returns {Promise<ResponseObject>}
     */
  async getAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params;

      await this._validator.validateQuery({ id });

      const album = await this._albumsService.getAlbumById(id);
      return h.response({
        status: 'success',
        data: {
          album,
        },
      }).code(200);
    } catch (error) {
      if (error instanceof ClientError) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(error.statusCode);
      }
      console.log(error.message);
      return h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami',
      }).code(500);
    }
  }

  /**
     * Handler untuk mendapatkan albums
     * @param {Object} request - Request object dari Hapi.js
     * @param {Object} h - Response toolkit dari Hapi.js
     * @returns {Promise<ResponseObject>}
     */
  async getAlbumsHandler(request, h) {
    try {
      const albums = await this._albumsService.getAlbums();
      return h.response({
        status: 'success',
        data: {
          albums,
        },
      }).code(200);
    } catch (error) {
      return h.response({
        status: 'fail',
        message: error.message,
      }).code(404);
    }
  }

  /**
     * Handler untuk memperbarui album berdasarkan ID
     * @param {Object} request - Request object dari Hapi.js
     * @param {Object} h - Response toolkit dari Hapi.js
     * @returns {Promise<ResponseObject>}
     */
  async putAlbumByIdHandler(request, h) {
    try {
      this._validator.validateAlbumPayload(request.payload);
      const { id } = request.params;
      const { name, year } = request.payload;

      await this._albumsService.editAlbumById(id, { name, year });

      return h.response({
        status: 'success',
        message: 'Album berhasil diperbarui',
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
     * Handler untuk menghapus album berdasarkan ID
     * @param {Object} request - Request object dari Hapi.js
     * @param {Object} h - Response toolkit dari Hapi.js
     * @returns {Promise<ResponseObject>}
     */
  async deleteAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params;

      await this._albumsService.deleteAlbumById(id);

      return h.response({
        status: 'success',
        message: 'Album berhasil dihapus',
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

module.exports = AlbumsHandler;
