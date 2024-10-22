class SongsHandler {
  constructor(songsService, validator) {
    this._songsService = songsService;
    this._validator = validator;
  }

  /**
     * Handler untuk menambahkan song
     * @param {Object} request - Request object dari Hapi.js
     * @param {Object} h - Response toolkit dari Hapi.js
     * @returns {Promise<ResponseObject>}
     */
  async postSongHandler(request, h) {
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
  }

  /**
     * Handler untuk mendapatkan song berdasarkan ID
     * @param {Object} request - Request object dari Hapi.js
     * @param {Object} h - Response toolkit dari Hapi.js
     * @returns {Promise<ResponseObject>}
     */
  async getSongByIdHandler(request, h) {
    const { id } = request.params;
    await this._validator.validateQuery({ id });
    const song = await this._songsService.getSongById(id);

    return h.response({
      status: 'success',
      data: {
        song,
      },
    }).code(200);
  }

  /**
     * Handler untuk mendapatkan songs
     * @param {Object} request - Request object dari Hapi.js
     * @param {Object} h - Response toolkit dari Hapi.js
     * @returns {Promise<ResponseObject>}
     */
  async getSongsHandler(request, h) {
    this._validator.validateQuery(request.query);
    const { title, performer } = request.query;
    const songs = await this._songsService.getSongs(title, performer);
    return h.response({
      status: 'success',
      data: {
        songs,
      },
    }).code(200);
  }

  /**
     * Handler untuk memperbarui song berdasarkan ID
     * @param {Object} request - Request object dari Hapi.js
     * @param {Object} h - Response toolkit dari Hapi.js
     * @returns {Promise<ResponseObject>}
     */
  async putSongByIdHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const { id } = request.params;
    const { title, genre, performer, duration, year, albumId } = request.payload;

    await this._songsService.editSongById(id, { title, genre, performer, duration, year, albumId });

    return h.response({
      status: 'success',
      message: 'Song berhasil diperbarui',
    }).code(200);
  }

  /**
     * Handler untuk menghapus song berdasarkan ID
     * @param {Object} request - Request object dari Hapi.js
     * @param {Object} h - Response toolkit dari Hapi.js
     * @returns {Promise<ResponseObject>}
     */
  async deleteSongByIdHandler(request, h) {
    const { id } = request.params;

    await this._songsService.deleteSongById(id);

    return h.response({
      status: 'success',
      message: 'Song berhasil dihapus',
    }).code(200);
  }
}

module.exports = SongsHandler;
