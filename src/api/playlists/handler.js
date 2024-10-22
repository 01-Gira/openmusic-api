class PlaylistsHandler {
  constructor(playlistsService, validator) {
    this._playlistsService = playlistsService;
    this._validator = validator;
  }

  /**
     * Handler untuk menambahkan playlist
     * @param {Object} request - Request object dari Hapi.js
     * @param {Object} h - Response toolkit dari Hapi.js
     * @returns {Promise<ResponseObject>}
     */
  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    console.log(credentialId);
    const playlistId = await this._playlistsService.addPlaylist({ name, credentialId });

    return h.response({
      status: 'success',
      message: 'Song berhasil ditambahkan',
      data: {
        playlistId,
      },
    }).code(201);
  }

  /**
     * Handler untuk mendapatkan playlists
     * @param {Object} request - Request object dari Hapi.js
     * @param {Object} h - Response toolkit dari Hapi.js
     * @returns {Promise<ResponseObject>}
     */
  async getPlaylistsHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;

    const playlists = await this._playlistsService.getPlaylists(credentialId);
    return h.response({
      status: 'success',
      data: {
        playlists,
      },
    }).code(200);
  }

  /**
     * Handler untuk memperbarui playlist berdasarkan ID
     * @param {Object} request - Request object dari Hapi.js
     * @param {Object} h - Response toolkit dari Hapi.js
     * @returns {Promise<ResponseObject>}
     */
  async putPlaylistByIdHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const { id } = request.params;

    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistOwner(id, credentialId);
    await this._playlistsService.editPlaylistById(id, request.payload);

    return h.response({
      status: 'success',
      message: 'Playlist berhasil diperbarui',
    }).code(200);
  }

  /**
     * Handler untuk menghapus playlist berdasarkan ID
     * @param {Object} request - Request object dari Hapi.js
     * @param {Object} h - Response toolkit dari Hapi.js
     * @returns {Promise<ResponseObject>}
     */
  async deletePlaylistByIdHandler(request, h) {
    const { id } = request.params;

    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(id, credentialId);
    await this._playlistsService.deletePlaylistById(id);

    return h.response({
      status: 'success',
      message: 'Playlist berhasil dihapus',
    }).code(200);
  }

  /**
     * Handler untuk mendapatkan playlist activities berdasarkan ID Playlist
     * @param {Object} request - Request object dari Hapi.js
     * @param {Object} h - Response toolkit dari Hapi.js
     * @returns {Promise<ResponseObject>}
     */
  async getPlaylistActivitiesByIdHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(id, credentialId);
    const activities = await this._playlistsService.getPlaylistActivities(id);

    return h.response({
      status: 'success',
      data: {
        playlistId: id,
        activities
      },
    }).code(200);
  }
}

module.exports = PlaylistsHandler;
