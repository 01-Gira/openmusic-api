class UploadsHandler{
  constructor(storageService, albumsService, validator){
    this._storageService = storageService;
    this._albumsService = albumsService;

    this._validator = validator;
  }

  async editCoverAlbumByIdHandler(request, h) {
    const { id } = request.params;
    const { cover } = request.payload;

    await this._validator.validateImageHeaders(cover.hapi.headers);

    const fileLocation = await this._storageService.writeFile(cover, cover.hapi);

    await this._albumsService.editCoverAlbumById(id, fileLocation);

    return h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah'
    }).code(201);
  }
}

module.exports = UploadsHandler;