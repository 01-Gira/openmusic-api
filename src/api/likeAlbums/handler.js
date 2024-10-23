class AlbumLikesHandler{
  constructor(albumsService, validator){
    this._albumsService = albumsService;
    this._validator = validator;
  }

  async getAlbumLikesHandler(request, h){
    const { id } = request.params;

    const result = await this._albumsService.getAlbumLikes(id);

    if (result.source === 'cache') {
      const response = h.response({
        status: 'success',
        data: result.data,
      }).code(200);

      response.header('X-Data-Source', 'cache');
      return response;
    }

    return h.response({
      status: 'success',
      data: {
        likes: result.likes,
      }
    }).code(200);
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