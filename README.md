GeoPicker
==========

![geopicker](docs/cover_600.png)

Geospatial dataset picker via fast Api Rest interface written in [NodeJs for GDAL](https://github.com/mmomtchev/node-gdal-async) bindings and [Fastify](https://www.fastify.io/)

- [Online Demo Map](https://opengeo.tech/geopicker)

- [Swagger API](https://opengeo.tech/geopicker/docs)

- [Article about this project](https://stefcud.medium.com/geopicker-bf4c4321c9ec)

## Scope

It is basically an advanced **elevation service** and Geopicker has been specially designed to offer the widest range of formats and methods of data requests that is possible, to adapt to any context of use by the client.
Each endpoint and the parameters it accepts have been designed on the basis of the functioning of already existing services, gathering a complete and coherent collection of APIs.
At present the index.html page contains a large implementation of browser side requests using LeafletJs as basemap and jQuery.

## Features
- **Large Rest API**: ergonomic endpoints suitable for any type of use case
- **Validation**: full validation of endpoint and parameters via **JSON-Schema** which allows output optimization
- **Configuration**: friendly configs and to help devs in many deployment contexts
- **Formats**: support for different geospatial input and output formats
- **Compression**: configurable output compression if client accept encoding: deflate,gzip

and includes some other additional functions:

- **Densify**: add more interpolated points in input coordinates, this improves the display on an elevation graph, adding intermediate positions at a minimum fixed distance.
- **Simplify**: unlike densify it removes points that are too close together from coordinates.
- **Height**: add the vertical distance from the ground, if input has elevation add a fourth coordinate with this value.
- **Metadata**: get additional informations for a certain geometry, can be for example the direction of a path.

## API Rest endpoints

The [API](https://opengeo.tech/geopicker/docs) is work in progress.
This basic structure can be extended starting from the environment variable `PREFIX` which by default `/`

(✔️ Work ❌ TODO 🚧 Work in Progress)

|Status|Method| Path                 | Return | Description |
|------|------|----------------------|--------|-------------|
|  ✔️  | GET  | /                    | html   | default demo map page if enabled by env var `DEMO_PAGE=true` |
|  ✔️  | GET  | /status              | object | service status, versions, datasets |
|  ✔️  | GET  | /datasets            | object | list available datasets and their attributes |
|  ✔️  | GET  | /:dataset            | object | show attributes of a certain dataset |
|      |      |                      |        |             |
|  ✔️  | GET  | /:dataset/:lon/:lat  | array  | get single location value of dataset, densify not supported|
|  ✔️  | GET  | /:dataset/:locations | array  | locations is a string (format: `lon,lat|lon,lat|lon,lat`), densify not supported |
|      |      |                      |        |             |
|  ✔️  | POST | /:dataset/lonlat     | arrays | accept array or object in body |
|  ✔️  | POST | /:dataset/locations  | arrays | accept array or object of locations in body (format is `[[lon,lat],[lon,lat],[lon,lat]]`) |
|  ✔️  | POST | /:dataset/geometry   | object | geojson Point or LineString in body (support feature/geometry/f.collection)|
|      |      |                      |        |             |
|  ❌  | GET  | /datasets/within/:lon/:lat    | object | search what dataset contains lon,lat |
|  ❌  | POST | /datasets/within/geometry     | object | search what dataset contains geometry in body |
|  ❌  | POST | /metadata/geometry   | object | return direction, length, centroid, middlepoint of geometry |

### Global Parameters

|Status|Parameter | Default  | Description |
|------|----------|----------|-------------|
|  ✔️  | precision| `input`  | rounded to digits decimal precision |
|  ✔️  | format   | `input`  | output format (✔️`json`,🚧`geojson`,✔️`polyline`,✔️`gpx`, ❌`csv`, ❌`kml`) |
|  ✔️  | densify  | `input`  | enable densification of points in the result |
|  🚧  | simplify | false    | enable simplication geometry of the result |
|  ❌  | height   | false    | add vertical distance from the ground(only input has elevation) |
|  ❌  | metadata | false    | additional metadata(direction,length) in output |

Some behaviors to know about parameters are that:

- only `POST` endpoints and some formats return coordinates and then support `precision` and `densify` parameters.
- from version v1.6.1 `/<datasetname>/...` is the same of `/datasets/<datasetname>/...` `datasets` is implicit.

# Usage

Running by official [Docker image](https://hub.docker.com/r/stefcud/geopicker):

```bash
docker run -v "/$(pwd)/tests/data:/data" -e DEMO_PAGE=true -p 9090:9090 stefcud/geopicker
```

Running from source code in development mode, requirements: _nodejs 16.x_ > and _glibc 2.28_ (_Ubuntu 20.x_ > ):

```bash
npm install
cd server && npm install && cd -
npm run dev
```
Browse the demo page: http://localhost:9090/

## Configuration

Full configuration options can be found in [docs config](./docs/config.md)

## Development

some useful tools for contributors `npm run <scriptname>`

- `docker-up` run in local docker-compose container
- `start` run in production mode
- `bench` run benchmarks
- `dev` run in development mode


# Requests Example

Get single location exchanging a few bytes:
```bash
 $ curl "http://localhost:9090/elevation/11.123/46.123"

[195]
```

Post a json object and receive the same decorated with the result(still works with `longitude`,`latitude`):
```bash
$ curl -X POST -d '{"lon": 11.123, "lat": 46.123"}' \
  -H 'Content-Type: application/json' \
  "http://localhost:9090/elevation/lonlat"

{"lon": 11.123,"lat": 46.123,"val":195}
```

Get many stringified locations in one time(designed for not too long LineString):
```bash
curl "http://localhost:9090/elevation/11.1,46.1|11.2,46.2|11.3,46.3"

[195,1149,1051]
```

Post a very long LineString saving bytes:
```bash
$ curl -X POST -d '[[10.9998,46.0064],[10.9998,46.0065],[10.9999,46.0066],[11.0000,46.0067]]' \
  -H 'Content-Type: application/json' \
  "http://localhost:9090/elevation/locations"

[[10.9998,46.0064,900],[10.9998,46.0065,898],[10.9999,46.0066,898],[11.0000,46.0067,900]]
```

Post anyone GeoJSON geometry, the same input geometry is always returned which has a third dimension:
```bash
$ curl -X POST -d '{"type":"LineString","coordinates":[[11.1,46.1],[11.2,46.2],[11.3,46.3]]}' \
  -H 'Content-Type: application/json' \
  "http://localhost:9090/elevation/geometry"

{"type":"LineString","coordinates":[[11.1,46.1,195],[11.2,46.2,1149],[11.3,46.3,1051]]}
```

Post a GeoJSON geometry of 2 points and Densify the linestring adding point each 400 meters,
this will help you build a less angular elevation graph:

```bash
$ curl -X POST -d '{"type":"LineString","coordinates":[[11,46],[11.01,46.01]]}' \
  -H 'Content-Type: application/json' \
  "http://localhost:9090/elevation/geometry?densify=400&precision=5"
```

output contains 3 additional interpolated locations with reduced precision digits:

```json
{
    "type": "Feature",
    "geometry": {
        "type": "LineString",
        "coordinates": [
          [11, 46, 897],
          [11.003, 46.003, 968],
          [11.006, 46.006, 1029],
          [11.009, 46.009, 1122],
          [11.01, 46.01, 1187]
        ]
    }
}
```

Get the elevation value between two locations every 100 meters

```bash
curl "http://localhost:9090/default/11,46|11.01,46.01?densify=100"

[925,858,909,963,968,1001,1018,997,1025,1062,1064,1102,1115,1163,1187]
```

## Benchmarks

benchmarks scripts: `tests/benchmarks.js` using [AutoCannon](https://github.com/mcollina/autocannon)

```bash
cd tests && npm install && cd -
npm run bench
```

The results testing a dataset of 2x2km [geotiff](https://github.com/opengeo-tech/geopicker/blob/master/tests/data/test_4611_dem.tif)
```
┌─────────┬──────┬──────┬───────┬──────┬─────────┬─────────┬──────┐
│ Stat    │ 2.5% │ 50%  │ 97.5% │ 99%  │ Avg     │ Stdev   │ Max  │
├─────────┼──────┼──────┼───────┼──────┼─────────┼─────────┼──────┤
│ Latency │ 0 ms │ 0 ms │ 0 ms  │ 1 ms │ 0.02 ms │ 0.16 ms │ 6 ms │
└─────────┴──────┴──────┴───────┴──────┴─────────┴─────────┴──────┘
┌───────────┬─────────┬─────────┬─────────┬─────────┬──────────┬─────────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%     │ 97.5%   │ Avg      │ Stdev   │ Min     │
├───────────┼─────────┼─────────┼─────────┼─────────┼──────────┼─────────┼─────────┤
│ Req/Sec   │ 18111   │ 18111   │ 22783   │ 23471   │ 22175.28 │ 1473.21 │ 18099   │
├───────────┼─────────┼─────────┼─────────┼─────────┼──────────┼─────────┼─────────┤
│ Bytes/Sec │ 4.02 MB │ 4.02 MB │ 5.05 MB │ 5.21 MB │ 4.92 MB  │ 327 kB  │ 4.01 MB │
└───────────┴─────────┴─────────┴─────────┴─────────┴──────────┴─────────┴─────────┘

Req/Bytes counts sampled once per second.
# of samples: 11

244k requests in 11.01s, 54.1 MB read
```

# Roadmap

for details see the descriptions in the [Roadmap issues](https://github.com/opengeo-tech/geopicker/labels/Roadmap)

|Status| Goal        |
|------|-------------|
|  ✔️   | Swagger Documentation Interface |
|  ❌  | manage multiple datasets |
|  🚧  | ES6 modules |
|  🚧  | extend benchmarks for any endpoints |
|  ❌  | enable densify function |
|  ❌  | enable simply function |
|  ❌  | unit testing |
|  ❌  | support vector format in datasets, such as shapefile  |
|  ❌  | supports complex geometries in input |
|  ❌  | limit access by api key |
|  ❌  | caching responses |
|  ❌  | interfaces: websocket, jsonrpc |
|  ❌  | command line interface |

## Copyright

Created by [Stefano Cudini](https://github.com/stefanocudini) [@zakis](https://twitter.com/zakis)
Distributed under the [BSD 2-Clause](https://opensource.org/licenses/BSD-2-Clause) license.
