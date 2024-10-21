const InvariantError = require('../../exceptions/InvariantError');
const { AlbumPayloadSchema, AlbumQuerySchema } = require('./schema');

const AlbumValidator = {
  validateAlbumPayload: (payload) => {
    const validationResult = AlbumPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateQuery:(query) => {
    const validationResult = AlbumQuerySchema.validate(query);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
    return validationResult;
  }
};

module.exports = AlbumValidator;