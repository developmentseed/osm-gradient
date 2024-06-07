import { useEffect } from "preact/hooks";
import MapLibreGL, { MapMouseEvent } from "maplibre-gl";
import { AppActionTypes, AppDispatch, AppState } from "../reducer";
import MaplibreGeocoder from "@maplibre/maplibre-gl-geocoder";
import "@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css";

interface MapProps {
  appState: AppState;
  dispatchAppState: AppDispatch;
}

const MAP_OPTIONS = {
  center: [-74, 40.6973],
  zoom: 10,
} as {
  center: [number, number];
  zoom: number;
};

const MAP_COLORS = {
  modified: "#619EFF",
  added: "#8CF8A3",
  deleted: "#FF7A7A",
};

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
              `https://api.mapbox.com/styles/v1/devseed/clx24j0bx02c001qm355b7gw4/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZGV2c2VlZCIsImEiOiJnUi1mbkVvIn0.018aLhX0Mb0tdtaT2QNe2Q`,
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
            maxzoom: 22,
          },
        ],
      },
      center: MAP_OPTIONS.center,
      zoom: MAP_OPTIONS.zoom,
      maxZoom: 18,
      minZoom: 0,
    });
    const scale = new MapLibreGL.ScaleControl({
      maxWidth: 160,
      unit: "metric",
    });
    map.addControl(scale);

    map.on("load", () => {
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

      const geocoderApi = {
        forwardGeocode: async (config: { query: string }) => {
          const features = [];
          try {
            const request = `https://nominatim.openstreetmap.org/search?q=${config.query}&format=geojson&polygon_geojson=1&addressdetails=1`;
            const response = await fetch(request);
            const geojson = await response.json();
            for (const feature of geojson.features) {
              const center = [
                feature.bbox[0] + (feature.bbox[2] - feature.bbox[0]) / 2,
                feature.bbox[1] + (feature.bbox[3] - feature.bbox[1]) / 2,
              ];
              const point = {
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: center,
                },
                place_name: feature.properties.display_name,
                properties: feature.properties,
                text: feature.properties.display_name,
                place_type: ["place"],
                center,
              };
              features.push(point);
            }
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error(`Failed to forwardGeocode with error: ${e}`);
          }

          return {
            features,
          };
        },
      };

      map.addControl(new MaplibreGeocoder(geocoderApi, { zoom: 10 }));

      function onClick(e: MapMouseEvent) {
        // @ts-expect-error - MapMouseEvent doesn't know about features
        const features = e.features as GeoJSON.Feature[];

        if (!features || features.length === 0) {
          return;
        }
        const { properties } = features[0];

        if (!properties) {
          return;
        }

        let tags = "";
        const tagObject = JSON.parse(properties.tags);
        for (const [key, value] of Object.entries(tagObject)) {
          tags = tags + "<dt>" + key + "=" + value + "</dt>";
        }
        const html = `<dl><dt><b>action:</b> ${properties.action}</dt>
        <dt><b>id:</b> ${properties.id}</dt>
        <dt><b>user:</b> ${properties.user}<dt>
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

  return <div id="map" />;
}
