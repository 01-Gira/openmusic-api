const routes = (handler) => [
  {
    method: 'POST',
    path: '/albums/{id}/covers',
    handler: (request, h) => handler.editCoverAlbumByIdHandler(request, h),
    options: {
      payload: {
        allow: 'multipart/form-data',
        multipart: true,
        output: 'stream',
        maxBytes: 500000,
      },
    },
  },
];

module.exports = routes;