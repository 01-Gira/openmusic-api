const Joi = require('joi');

const SongsPayloadSchema = Joi.object({
  title: Joi.string().required(),
  genre: Joi.string().required(),
  performer: Joi.string().required(),
  duration: Joi.number().required(),
  year: Joi.number().required(),
  albumId: Joi.string()
});

const SongsQuerySchema = Joi.object({
  id: Joi.string().empty('').lowercase(),
  title: Joi.string().empty('').lowercase(),
  genre: Joi.string().empty('').lowercase(),
  performer: Joi.string().empty('').lowercase(),
  duration: Joi.number().empty('')
});

module.exports = { SongsPayloadSchema, SongsQuerySchema };