import { useEffect, useRef } from "preact/hooks";
import MapLibreGL from "maplibre-gl";
import { AppActionTypes, AppState } from "../reducer";

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

export function Map(props: MapProps) {
  const { appState, dispatchAppState } = props;

  useEffect(() => {
    // Return early if we already have a map
    if (appState && appState.map) {
      return;
    }

    const map = new MapLibreGL.Map({
      container: "map",
      style: "https://demotiles.maplibre.org/style.json",
      center: MAP_OPTIONS.center,
      zoom: MAP_OPTIONS.zoom,
      maxZoom: 18,
      minZoom: 0,
    });

    map.on("load", () => {
      map.addSource("data", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: "data-point",
        type: "circle",
        source: "data",
        paint: {
          "circle-radius": 6,
          "circle-color": "#B42222",
        },
        filter: ["==", "$type", "Point"],
      });
      map.addLayer({
        id: "data-fill",
        type: "fill",
        source: "data",
        filter: ["==", "$type", "Polygon"],
        paint: {
          "fill-color": "#FEB24C",
        },
      });
      map.addLayer({
        id: "data-line",
        type: "line",
        source: "data",
        filter: ["==", "$type", "LineString"],
        paint: {
          "line-color": "#800026",
          "line-opacity": 0.8,
          "line-width": 2,
        },
      });

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

      // function onClick(e) {
      //   const props = e.features[0].properties;
      //   let tags = "";
      //   let tagObject = JSON.parse(props.tags);
      //   for (const [key, value] of Object.entries(tagObject)) {
      //     tags = tags + "<dt>" + key + "=" + value + "</dt>";
      //   }
      //   const html = `<dl><dt><b>action:</b> ${props.action}</dt>
      //   <dt><b>id:</b> ${props.id}</dt>
      //   <dt><b>user:</b> ${props.user}<dt>
      //   <br />
      //   ${tags}
      //   </dl>`;
      //   new MapLibreGL.Popup().setLngLat(e.lngLat).setHTML(html).addTo(map);
      // }

      // map.on("click", "data-point", onClick);
      // map.on("click", "data-fill", onClick);
      // map.on("click", "data-line", onClick);

      // // if the user is panning around alot, only update once per second max
      // updateResults = _.throttle(updateResults, 1000);

      // // show a rectangle corresponding to our bounding box
      // map.getSource("rectangle").setData(getRect());

      // // show results based on the initial map
      // updateResults();

      // // ...and update the results whenever the map moves
      // map.on("moveend", function (s) {
      //   map.getSource("rectangle").setData(getRect());
      //   updateResults();
      // });

      dispatchAppState({
        type: AppActionTypes.LOAD_MAP,
        data: map,
      });
    });
  }, [appState?.map]);

  return <div id="map"></div>;
}
