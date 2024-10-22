const routes = (handler) => [
  {
    method : 'GET',
    path: '/albums/{id}/likes',
    handler: (request, h) => handler.getAlbumLikesHandler(request, h)
  },
  {
    method: 'POST',
    path: '/albums/{id}/likes',
    handler: (request, h) => handler.addAlbumLikeHandler(request, h),
    options: {
      auth: 'openmusic_jwt'
    }
  },
  {
    method: 'DELETE',
    path: '/albums/{id}/likes',
    handler: (request, h) => handler.deleteAlbumLikeHandler(request, h),
    options: {
      auth: 'openmusic_jwt'
    }
  }
];

module.exports = routes;