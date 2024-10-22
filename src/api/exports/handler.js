class ExportsHandler {
  constructor(producerService, playlistsService, validator) {
    this._producerService = producerService;
    this._playlistsService = playlistsService;
    this._validator = validator;
  }

  async postExportNotesHandler(request, h) {
    const { id } = request.params;
    this._validator.validateExportPlaylistSongsPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;

    const message = {
      playlistId: id,
      userId: request.auth.credentials.id,
      targetEmail: request.payload.targetEmail,
    };
    await this._playlistsService.verifyPlaylistOwner(id, credentialId);

    await this._playlistsService.getPlaylistById(id, credentialId);

    await this._producerService.sendMessage('export:playlist_songs', JSON.stringify(message));

    return h.response({
      status: 'success',
      message: 'Permintaan Anda dalam antrean',
    }).code(201);
  }
}

module.exports = ExportsHandler;