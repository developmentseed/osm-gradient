import { geojson as flatgeobuf } from "flatgeobuf";
import { getFlatGeobufRectangle } from "./get-fgb-rect";
import { Map } from "maplibre-gl";

export async function getFgbData({
  map,
  timestamp,
}: {
  map: Map;
  timestamp: Date;
}) {
  let i = 0;
  const geojson = { type: "FeatureCollection", features: [] as any[] };

  const filename = `https://storage.googleapis.com/osm-tardis/${timestamp
    .toISOString()
    .slice(0, 13)}%3A00.fgb`;

  const iter = flatgeobuf.deserialize(
    filename,
    getFlatGeobufRectangle(map),
  ) as AsyncGenerator<any>;

  const timestamps = new Set();

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
      geojson.features.push({ ...feature, id: i });
      i += 1;
      timestamps.add(properties.timestamp);
    }
  }

  return { geojson, timestamps: Array.from(timestamps).sort() };
}
