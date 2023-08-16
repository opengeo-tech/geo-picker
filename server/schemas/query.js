//TODO rename querystring
module.exports = (S, fastify) => {

  const {config: {formats}} = fastify

  return {
    query: S.object()
        .prop('format',
          S.string().enum(formats)
        )
        .prop('precision',
          S.object()
          .oneOf([
            S.number().minimum(1).maximum(10),
            S.string().const('input')
          ])
        )
  }
}