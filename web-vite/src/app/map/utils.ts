import { geojson as flatgeobuf } from "flatgeobuf";

export function fbgBbox(map: any) {
  const { lng, lat } = map.getCenter();
  const { _sw, _ne } = map.getBounds();
  const distanceX =
    Math.min(Math.abs(_sw.lng - lng), Math.abs(_ne.lng - lng)) * 0.9;
  const distanceY =
    Math.min(Math.abs(_sw.lat - lat), Math.abs(_ne.lat - lat)) * 0.9;
  return {
    minX: lng - distanceX,
    minY: lat - distanceY,
    maxX: lng + distanceX,
    maxY: lat + distanceY,
  };
}

export async function getFgbData(map: any) {
  let i = 0;
  const geojson = { type: "FeatureCollection", features: [] };

  let iter = flatgeobuf.deserialize(
    "https://storage.googleapis.com/osm-tardis/2013-02-03T15%3A00.fgb",
    fbgBbox(map)
  );

  for await (let feature of iter) {
    if (
      feature.properties.type !== "relation" &&
      (feature.properties.changeType === "added" ||
        feature.properties.changeType === "modifiedNew" ||
        feature.properties.changeType === "deletedNew")
    ) {
      geojson.features = geojson.features.concat({ ...feature, id: i });
      i += 1;
    }
  }

  return {
    geojson,
    stats: calculateStats(geojson),
  };
}

function calculateStats(features) {
  const stats = {
    tags: {},
    buildings :0,
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
  for (let feature of features.features) {
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
