import { geojson as flatgeobuf } from "flatgeobuf";
import { getFlatGeobufRectangle } from "../utils/get-flatgeobuf-rect";

export async function getFgbData(map: any) {
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

export function calculateStats(geojson: any) {
  const stats = {
    tags: {},
    buildings: 0,
    buildingsAdded: 0,
    buildingsModified: 0,
    buildingsDeleted: 0,
    highways: 0,
    highwaysAdded: 0,
    highwaysModified: 0,
    highwaysDeleted: 0,
    other: 0,
    otherAdded: 0,
    otherModified: 0,
    otherDeleted: 0,
    users: {},
  };

  for (const feature of geojson.features) {
    const changeType = feature.properties.changeType;
    if (
      changeType === "added" ||
      changeType === "modifiedNew" ||
      changeType === "deletedNew"
    ) {
      const user = feature.properties.user;
      const tags = JSON.parse(feature.properties.tags);

      if (changeType === "added") {
        if (tags.building) {
          stats.buildings += 1;
          stats.buildingsAdded += 1;
        } else if (tags.highway) {
          stats.highways += 1;
          stats.highwaysAdded += 1;
        } else {
          stats.other += 1;
          stats.otherAdded += 1;
        }
      }
      if (changeType === "modifiedNew") {
        if (tags.building) {
          stats.buildings += 1;
          stats.buildingsModified += 1;
        } else if (tags.highway) {
          stats.highways += 1;
          stats.highwaysModified += 1;
        } else {
          stats.other += 1;
          stats.otherModified += 1;
        }
      }
      if (changeType === "deletedNew") {
        if (tags.building) {
          stats.buildings += 1;
          stats.buildingsDeleted += 1;
        } else if (tags.highway) {
          stats.highways += 1;
          stats.highwaysDeleted += 1;
        } else {
          stats.other += 1;
          stats.otherDeleted += 1;
        }
      }

      Object.keys(tags).forEach((k) => {
        stats.tags[k] = (stats.tags[k] || 0) + 1;
      });
      stats.users[user] = (stats.users[user] || 0) + 1;
    }
  }

  return stats;
}
