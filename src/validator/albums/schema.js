const Joi = require('joi');

const AlbumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().integer().min(1900).max(new Date().getFullYear()).required(),
});

const AlbumQuerySchema = Joi.object({
  id: Joi.string().empty(''),
  name: Joi.string().empty(''),
  year: Joi.number().empty(''),
});

module.exports = { AlbumPayloadSchema, AlbumQuerySchema };