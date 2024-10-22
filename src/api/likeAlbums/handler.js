class AlbumLikesHandler{
  constructor(albumsService, validator){
    this._albumsService = albumsService;
    this._validator = validator;
  }

  async getAlbumLikesHandler(request, h){
    const { id } = request.params;

    const { source, data } = await this._albumsService.getAlbumLikes(id);

    const response = h.response({
      status : 'success',
      data
    }).code(200);

    if (source === 'cache') {
      response.header('X-Data-Source', 'cache');
    }

    return response;
  }

  async addAlbumLikeHandler(request, h){
    const { id: albumId } = request.params;

    const { id : credentialId } = request.auth.credentials;

    await this._albumsService.getAlbumById(albumId);
    await this._albumsService.addAlbumLike(albumId, credentialId);

    return h.response({
      status : 'success',
      message : 'Album berhasil disukai'
    }).code(201);
  }

  async deleteAlbumLikeHandler(request, h){
    const { id: albumId } = request.params;

    const { id : credentialId } = request.auth.credentials;

    await this._albumsService.getAlbumById(albumId);
    await this._albumsService.deleteAlbumLike(albumId, credentialId);

    return h.response({
      status : 'success',
      message : 'Berhasil menghapus like'
    }).code(200);
  }
}

module.exports = AlbumLikesHandler;