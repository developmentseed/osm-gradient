## Usage

Generate the past 10 minutes of OSM data starting at a sequence number (5652386 in this example)

```
docker build -t osm-gradient .
docker run -t osm-gradient 5652386 10
docker run -it -v ./data:/tmp ghcr.io/osgeo/gdal:alpine-small-latest sh ogr2ogr -f "FlatGeobuf" /tmp/test.fgb /tmp/2023-09-01T01_00.geojsonld -skipfailures
```
