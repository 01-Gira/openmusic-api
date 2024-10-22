class AlbumsHandler {
  constructor(albumsService, validator) {
    this._albumsService = albumsService;
    this._validator = validator;
  }

  /**
     * Handler untuk menambahkan album
     * @param {Object} request - Request object dari Hapi.js
     * @param {Object} h - Response toolkit dari Hapi.js
     * @returns {Promise<ResponseObject>}
     */
  async postAlbumHandler(request, h) {
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
  }

  /**
     * Handler untuk mendapatkan album berdasarkan ID
     * @param {Object} request - Request object dari Hapi.js
     * @param {Object} h - Response toolkit dari Hapi.js
     * @returns {Promise<ResponseObject>}
     */
  async getAlbumByIdHandler(request, h) {
    const { id } = request.params;

    await this._validator.validateQuery({ id });

    const album = await this._albumsService.getAlbumById(id);
    return h.response({
      status: 'success',
      data: {
        album,
      },
    }).code(200);
  }

  /**
     * Handler untuk mendapatkan albums
     * @param {Object} request - Request object dari Hapi.js
     * @param {Object} h - Response toolkit dari Hapi.js
     * @returns {Promise<ResponseObject>}
     */
  async getAlbumsHandler(request, h) {

    const albums = await this._albumsService.getAlbums();
    return h.response({
      status: 'success',
      data: {
        albums,
      },
    }).code(200);
  }

  /**
     * Handler untuk memperbarui album berdasarkan ID
     * @param {Object} request - Request object dari Hapi.js
     * @param {Object} h - Response toolkit dari Hapi.js
     * @returns {Promise<ResponseObject>}
     */
  async putAlbumByIdHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;
    const { name, year } = request.payload;

    await this._albumsService.editAlbumById(id, { name, year });

    return h.response({
      status: 'success',
      message: 'Album berhasil diperbarui',
    }).code(200);

  }

  /**
     * Handler untuk menghapus album berdasarkan ID
     * @param {Object} request - Request object dari Hapi.js
     * @param {Object} h - Response toolkit dari Hapi.js
     * @returns {Promise<ResponseObject>}
     */
  async deleteAlbumByIdHandler(request, h) {

    const { id } = request.params;

    await this._albumsService.deleteAlbumById(id);

    return h.response({
      status: 'success',
      message: 'Album berhasil dihapus',
    }).code(200);
  }
}

module.exports = AlbumsHandler;
