import { useEffect } from "preact/hooks";
import { AppActionTypes, AppState } from "../reducer";
import MapLibreGL from "maplibre-gl";
import MaplibreGeocoder from "@maplibre/maplibre-gl-geocoder";
import "@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css";

interface MapProps {
  appState: AppState;
  dispatchAppState: any;
}

const MAP_OPTIONS = {
  center: [-74.5087291, 40.28],
  zoom: 14,
} as {
  center: [number, number];
  zoom: number;
};

const MAP_COLORS = {
  modified: '#619EFF',
  added: '#8CF8A3',
  deleted: '#FF7A7A',
}

export function Map(props: MapProps) {
  const { appState, dispatchAppState } = props;

  useEffect(() => {
    // When the map is already initialized, do a first view update
    if (appState && appState.map) {
      dispatchAppState({
        type: AppActionTypes.UPDATE_VIEW,
      });
      return;
    }

    const map = new MapLibreGL.Map({
      container: "map",
      style: {
        version: 8,
        sources: {
          basemap: {
            type: "raster",
            tileSize: 256,
            tiles: [
              `https://api.mapbox.com/styles/v1/ingalls/ckvh0wwm8g2cw15r05ozt0ybr/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZGV2c2VlZCIsImEiOiJjbG03b3NudWEwMnlmM2RzMjlhdjNrZzFmIn0.DKX63r8pJPPTqSxrV_y58Q`,
            ],
          },
        },
        layers: [
          {
            id: "background",
            type: "background",
            paint: {
              "background-color": "rgb(4,7,14)",
            },
          },
          {
            id: "basemap",
            type: "raster",
            source: "basemap",
            minzoom: 0,
            maxzoom: 15,
          },
        ],
      },
      center: MAP_OPTIONS.center,
      zoom: MAP_OPTIONS.zoom,
      maxZoom: 18,
      minZoom: 0,
    });

    map.on("load", () => {
      var GeoAPI = {
        forwardGeocode: (config) => {
          return { features: [] };
        },
        reverseGeocode: (config) => {
          return { features: [] };
        },
      };
      var geocoder = new MaplibreGeocoder(GeoAPI, {});
      geocoder.addTo("#map");

      map.addSource("data", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addLayer({
        id: "data-fill",
        type: "fill",
        source: "data",
        filter: ["any", ["==", "$type", "Polygon"]],
        paint: {
          "fill-opacity": 0.1,
          "fill-color": [
            "match",
            ["get", "changeType"],
            // Added features color
            "added",
            MAP_COLORS.added,
            // Modified features color
            "modifiedNew",
            MAP_COLORS.modified,
            // Removed features color
            "deletedNew",
            MAP_COLORS.deleted,
            // Default color for other features
            "#000",
          ],
        },
      });

      map.addLayer({
        id: "data-line",
        type: "line",
        source: "data",
        filter: [
          "any",
          ["==", "$type", "Polygon"],
          ["==", "$type", "LineString"],
        ],
        paint: {
          "line-opacity": 0.8,
          "line-width": 2,
          "line-color": [
            "match",
            ["get", "changeType"],
            // Added features color
            "added",
            MAP_COLORS.added,
            // Modified features color
            "modifiedNew",
            MAP_COLORS.modified,
            // Removed features color
            "deletedNew",
            MAP_COLORS.deleted,
            // Default color for other features
            "#000",
          ],
        },
      });

      map.addLayer({
        id: "data-point",
        type: "circle",
        source: "data",
        filter: ["==", "$type", "Point"],
        paint: {
          "circle-stroke-color": [
            "match",
            ["get", "changeType"],
            // Added features color
            "added",
            MAP_COLORS.added,
            // Modified features color
            "modifiedNew",
            MAP_COLORS.modified,
            // Removed features color
            "deletedNew",
            MAP_COLORS.deleted,
            // Default color for other features
            "#000",
          ],
          "circle-stroke-width": 2,
          "circle-radius": 2,
          "circle-opacity": 0,
        },
      });

      function onClick(e) {
        const props = e.features[0].properties;
        let tags = "";
        let tagObject = JSON.parse(props.tags);
        for (const [key, value] of Object.entries(tagObject)) {
          tags = tags + "<dt>" + key + "=" + value + "</dt>";
        }
        const html = `<dl><dt><b>action:</b> ${props.action}</dt>
        <dt><b>id:</b> ${props.id}</dt>
        <dt><b>user:</b> ${props.user}<dt>
        <br />
        ${tags}
        </dl>`;
        new MapLibreGL.Popup().setLngLat(e.lngLat).setHTML(html).addTo(map);
      }

      map.on("click", "data-point", onClick);
      map.on("click", "data-fill", onClick);
      map.on("click", "data-line", onClick);

      map.addSource("rectangle", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: "rectangle",
        type: "line",
        source: "rectangle",
        paint: {
          "line-color": "#0000FF",
          "line-opacity": 0.9,
          "line-width": 3,
        },
      });

      map.on("moveend", () => {
        dispatchAppState({
          type: AppActionTypes.UPDATE_VIEW,
        });
      });

      dispatchAppState({
        type: AppActionTypes.SET_MAP_REF,
        data: { map },
      });
    });
  }, [appState?.map]);

  return <div id="map"></div>;
}
