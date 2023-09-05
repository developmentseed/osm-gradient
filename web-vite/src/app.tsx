import { useEffect, useRef } from "preact/hooks";
import MapLibreGL from "maplibre-gl";

import "./app.css";

export function App() {
  const mapRef = useRef();

  useEffect(() => {
    if (mapRef?.current) return;

    // basic MapLibre map
    const map = new MapLibreGL.Map({
      container: "map",
      style: "https://demotiles.maplibre.org/style.json",
      center: [0, 30],
      zoom: 2,
      maxZoom: 18,
      minZoom: 0,
    });

    map.on("load", () => {
      mapRef.current = map;
    });
  }, [mapRef]);

  return (
    <>
      <div id="map"></div>
    </>
  );
}
