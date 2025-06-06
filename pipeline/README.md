## Usage

Generate an hour of OSM data starting at 2024-05-18 02:00 UTC:

Note:
- The date and hour is UTC
- The hour needs to be in the format `HH` (e.g. `02` for 2am)
- The output will be in the `data` directory in the current working directory under a subdirectory named after the date and hour

```sh

docker build -t osm-gradient .
docker run -it -v ./data:/tmp osm-gradient sh -c "./cli.js process-hour 2025-05-18 02"
docker run -it -v ./data:/tmp osm-gradient sh -c "ogr2ogr -f FlatGeobuf /tmp/2025-05-18T02/2025-05-18T02:00.fgb /tmp/2025-05-18T02/2025-05-18T02:00.geojson -skipfailures"
```