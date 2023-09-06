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
  const fc = { type: "FeatureCollection", features: [] };

  let iter = flatgeobuf.deserialize("public/sample-data.fgb", fbgBbox(map));

  for await (let feature of iter) {
    if (
      feature.properties.type !== "relation" &&
      (feature.properties.changeType === "added" ||
        feature.properties.changeType === "modifiedNew" ||
        feature.properties.changeType === "deletedNew")
    ) {
      fc.features = fc.features.concat({ ...feature, id: i });
      i += 1;
    }
  }

  return fc;
}
