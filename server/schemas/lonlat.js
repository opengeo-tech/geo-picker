
module.exports = (S, fastify) => {

  const {query} = require('./query')(S, fastify)
      , {datasetsNames} = fastify

  return {
    lonlat: {
      description: 'Get single value by longitude and latitude',
      params: S.object()
        .prop('dataset', S.string().enum(datasetsNames)).required()
        .prop('lon', S.number().minimum(-180).maximum(180)).required()
        .prop('lat', S.number().minimum(-90).maximum(90)).required(),
      query,
      response: {
        200: S.array().items(S.integer())
      }
    },
    lonlatPost: {
      description: 'Post single array or object location in body',
      params: S.object().prop('dataset', S.string().enum(datasetsNames)).required(),
      query,
      body: S.object()
        .prop('lon', S.number().minimum(-180).maximum(180)).required()
        .prop('lat', S.number().minimum(-90).maximum(90)).required(),
      response: {
        200: S.object()
          .prop('lon', S.number().minimum(-180).maximum(180)).required()
          .prop('lat', S.number().minimum(-90).maximum(90)).required()
          .prop('val', S.integer())
      }
    }
  }
}