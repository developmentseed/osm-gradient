import { useEffect, useRef } from "preact/hooks";
import MapLibreGL from "maplibre-gl";
import { AppActionTypes, AppState } from "../reducer";

interface MapProps {
  appState: AppState;
  dispatchAppState: any;
}

export function Map(props: MapProps) {
  const { appState, dispatchAppState } = props;
  const mapRef = useRef();

  useEffect(() => {
    if (appState.map) return;

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
      dispatchAppState({
        type: AppActionTypes.SET_MAP_REF,
        data: map,
      });
    });
  }, [mapRef]);

  return <div id="map"></div>;
}
