import { geojson as flatgeobuf } from "flatgeobuf";
import { getFlatGeobufRectangle } from "./get-fgb-rect";
import { Map } from "maplibre-gl";

export async function getFgbData({ map }: { map: Map }) {
  let i = 0;
  const geojson = { type: "FeatureCollection", features: [] as any[] };

  const iter = flatgeobuf.deserialize(
    "https://storage.googleapis.com/osm-tardis/2013-02-03T15%3A00.fgb",
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
