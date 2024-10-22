class PlaylistSongsHandler {
  constructor(playlistSongsService, playlistsService, validator) {
    this._playlistSongsService = playlistSongsService;
    this._playlistsService = playlistsService;
    this._validator = validator;
  }

  /**
     * Handler untuk mendapatkan playlist song berdasarkan ID Playlist
     * @param {Object} request - Request object dari Hapi.js
     * @param {Object} h - Response toolkit dari Hapi.js
     * @returns {Promise<ResponseObject>}
     */
  async getPlaylistSongsHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(id, credentialId);
    const playlist = await this._playlistSongsService.getPlaylistSongs(id, credentialId);

    return h.response({
      status: 'success',
      data: {
        playlist,
      },
    }).code(200);
  }

  /**
     * Handler untuk menambahkan playlist song berdasarkan ID Playlist dan song ID payload
     * @param {Object} request - Request object dari Hapi.js
     * @param {Object} h - Response toolkit dari Hapi.js
     * @returns {Promise<ResponseObject>}
     */
  async addPlaylistSongHandler(request, h) {
    this._validator.validatePlaylistSongPayload(request.payload);
    const { id } = request.params;

    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(id, credentialId);
    const playlistSongId = await this._playlistSongsService.addPlaylistSong(id, credentialId, request.payload);

    return h.response({
      status: 'success',
      message: 'Song berhasil ditambahkan ke playlist',
      data: {
        playlistSongId,
      },
    }).code(201);
  }

  /**
     * Handler untuk menghapus song dari playlist berdasarkan ID playlist dan song ID payload
     * @param {Object} request - Request object dari Hapi.js
     * @param {Object} h - Response toolkit dari Hapi.js
     * @returns {Promise<ResponseObject>}
     */
  async deletePlaylistSongHandler(request, h) {
    this._validator.validatePlaylistSongPayload(request.payload);
    const { id } = request.params;

    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(id, credentialId);
    await this._playlistSongsService.deletePlaylistSong(id, credentialId, request.payload);

    return h.response({
      status: 'success',
      message: 'Song berhasil dihapus dari playlist'
    }).code(200);
  }

}

module.exports = PlaylistSongsHandler;