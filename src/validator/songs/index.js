const InvariantError = require('../../exceptions/InvariantError');
const { SongsPayloadSchema, SongsQuerySchema } = require('./schema');

const SongsValidator = {
  validateSongPayload: (payload) => {
    const validationResult = SongsPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateQuery:(query) => {
    const validationResult = SongsQuerySchema.validate(query);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
    return validationResult;
  }
};

module.exports = SongsValidator;