
const {resolve, join} = require('path')
    , fs = require('fs')
    , favicon = fs.readFileSync(`${__dirname}/../favicon.png`);

module.exports = async fastify => {

  const {config} = fastify
      , {prefix, demopage: {path}} = config
      , htmlpath = resolve(`${__dirname}/../../index.html`)
      , html = fs.readFileSync(htmlpath).toString()
      , noCache = {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      };

  fastify.addHook('onReady', async () => {
    const demopath = join(prefix, path)
    fastify.log.info(`Demo page available at path: ${demopath}`);
  });

  fastify.get(join(path,'favicon.ico'), {
      schema: {
        //hide from swagger
        hide:true
      }
    }, async (req, res) => {
    res.type('image/png').send(favicon);
  });

  fastify.get(resolve(path), {
      schema: {
        description: 'Interactive demo page which demonstrates how it works GeoPicker endpoints',
      }
    }, async (req, res) => {
    await res.headers(noCache).type('text/html').send(html)
  });
}