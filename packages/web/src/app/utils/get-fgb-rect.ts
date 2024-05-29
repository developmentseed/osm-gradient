import { Map } from "maplibre-gl";

export function getFlatGeobufRectangle(map: Map) {
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
