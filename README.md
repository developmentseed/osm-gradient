Minutely metrics for OpenStreetMap using FlatGeoBuff

## Usage

Generate the past 10 minutes of OSM data starting at a sequence number (5652386 in this example)

```
docker build osm-tardis .
docker run osm-tardis 5652386 10
docker run -it -v ./data:/tmp ghcr.io/osgeo/gdal:alpine-small-latest sh ogr2ogr -f "FlatGeobuf" /tmp/test.fgb /tmp/final_geojson.json -skipfailures
```

This will generate a FlatGeobuf file in the `data` directory.

You can then view the data using the viewer in the `web` directory by running:

```
npm install
npm run start
```
