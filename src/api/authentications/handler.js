class AuthenticationsHandler {
  constructor(authenticationsService, usersService, tokenManager, validator) {
    this._authenticationsService = authenticationsService;
    this._usersService = usersService;
    this._tokenManager = tokenManager;
    this._validator = validator;
  }

  async postAuthenticationHandler(request, h) {
    this._validator.validatePostAuthenticationPayload(request.payload);

    const { username, password } = request.payload;
    const id = await this._usersService.verifyUserCredential(username, password);
    const accessToken = this._tokenManager.generateAccessToken({ id, username });
    const refreshToken = this._tokenManager.generateRefreshToken({ id, username });

    await this._authenticationsService.addRefreshToken(refreshToken);

    return h.response({
      status: 'success',
      message: 'Authentication berhasil ditambahkan',
      data: {
        accessToken,
        refreshToken,
      },
    }).code(201);
  }

  async putAuthenticationHandler(request, h) {
    this._validator.validatePutAuthenticationPayload(request.payload);

    const { refreshToken } = request.payload;
    await this._authenticationsService.verifyRefreshToken(refreshToken);
    const { id, username } = this._tokenManager.verifyRefreshToken(refreshToken);

    const accessToken = this._tokenManager.generateAccessToken({ id, username });
    return h.response({
      status: 'success',
      message: 'Access Token berhasil diperbarui',
      data: {
        accessToken,
      },
    }).code(200);
  }

  async deleteAuthenticationHandler(request, h) {
    this._validator.validateDeleteAuthenticationPayload(request.payload);

    const { refreshToken } = request.payload;
    await this._authenticationsService.verifyRefreshToken(refreshToken);
    await this._authenticationsService.deleteRefreshToken(refreshToken);

    return h.response({
      status: 'success',
      message: 'Refresh token berhasil dihapus',
    }).code(200);
  }
}

module.exports = AuthenticationsHandler;