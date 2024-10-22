const AlbumLikesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'albumlikes',
  version: '1.0.0',
  register: async (server, { albumsService, validator }) => {
    const albumLikesHandler = new AlbumLikesHandler(albumsService, validator);
    server.route(routes(albumLikesHandler));
  },
};