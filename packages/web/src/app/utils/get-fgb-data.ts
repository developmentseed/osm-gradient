import { geojson as flatgeobuf } from "flatgeobuf";
import { getFlatGeobufRectangle } from "./get-fgb-rect";
import { GeoJSONFeature, Map } from "maplibre-gl";

export async function getFgbData({
  map,
  timestamp,
}: {
  map: Map;
  timestamp: Date;
}): Promise<GeoJSON.FeatureCollection> {
  const geojson: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: [] as GeoJSONFeature[],
  };

  const filename = `https://storage.googleapis.com/osm-tardis/${timestamp
    .toISOString()
    .slice(0, 13)}%3A00.fgb`;

  const iter = flatgeobuf.deserialize(
    filename,
    getFlatGeobufRectangle(map),
  ) as AsyncGenerator<GeoJSONFeature>;

  for await (const feature of iter) {
    const { properties } = feature;

    if (!properties || properties === null || properties === undefined) {
      continue;
    }

    if (
      properties.type !== "relation" &&
      (properties.changeType === "added" ||
        properties.changeType === "modifiedNew" ||
        properties.changeType === "deletedNew")
    ) {
      geojson.features = [...geojson.features, feature];
    }
  }

  return geojson;
}
