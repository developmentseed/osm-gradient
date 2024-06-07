import { useReducerAsync } from "use-reducer-async";
// eslint-disable-next-line no-duplicate-imports
import type { AsyncActionHandlers } from "use-reducer-async";
import logReducer from "./log.ts";
import { calculateStats } from "../map/utils.ts";
import tArea from "@turf/area";
import tBboxPolygon from "@turf/bbox-polygon";
import { getFgbData } from "../utils/get-fgb-data.ts";
import { Map } from "maplibre-gl";
import { useEffect } from "preact/hooks";

// eslint-disable-next-line no-duplicate-imports
import type { Dispatch, Reducer } from "preact/hooks";

const availableTimestamps = [
  `2024-05-19T05:00:00Z`,
  `2024-05-19T06:00:00Z`,
  `2024-05-19T07:00:00Z`,
  `2024-05-19T08:00:00Z`,
];

// TODO move to types.ts
/* eslint-disable no-unused-vars */
export enum MapStatus {
  IDLE = "IDLE",
  LOADING = "LOADING",
  READY = "READY",
}

export enum AppActionTypes {
  SET_MAP_REF = "SET_MAP_REF",
  SET_CURRENT_TIMESTAMP = "SET_CURRENT_TIMESTAMP",
  UPDATE_VIEW = "UPDATE_VIEW",
  UPDATE_VIEW_START = "UPDATE_VIEW_START",
  UPDATE_VIEW_SUCCESS = "UPDATE_VIEW_SUCCESS",
  UPDATE_VIEW_ERROR = "UPDATE_VIEW_ERROR",
}

// Utility function to update URL params
const updateURLParams = (params: Record<string, string | number | boolean>) => {
  const url = new URL(window.location.href);
  Object.keys(params).forEach((key) =>
    url.searchParams.set(key, String(params[key])),
  );
  window.history.pushState({}, "", url.href);
};

export type AppReducer<State, Action> = (state: State, action: Action) => State;
/* eslint-enable no-unused-vars */

export interface AppState {
  map?: Map;
  mapStatus: MapStatus;
  mapData: GeoJSON.FeatureCollection;
  currentTimestamp: Date;
  timestamps: string[];
}

const getInitialStateFromURL = () => {
  const urlParams = new URLSearchParams(window.location.search);

  const lng = urlParams.get("lng");
  const lat = urlParams.get("lat");
  const zoom = urlParams.get("zoom");
  const timestamp = urlParams.get("timestamp");

  return {
    map: undefined,
    mapStatus: MapStatus.IDLE,
    mapData: {
      type: "FeatureCollection" as const,
      features: [],
    },
    currentTimestamp: timestamp
      ? new Date(timestamp)
      : new Date(availableTimestamps[2]),
    timestamps: [...availableTimestamps],
    initialView: {
      lng: lng ? parseFloat(lng) : undefined,
      lat: lat ? parseFloat(lat) : undefined,
      zoom: zoom ? parseFloat(zoom) : undefined,
    },
  };
};

const appInitialState: AppState = getInitialStateFromURL();

export type AppAction =
  | {
      type: AppActionTypes.SET_MAP_REF;
      data: {
        map: Map;
      };
    }
  | {
      type: AppActionTypes.SET_CURRENT_TIMESTAMP;
      data: {
        currentTimestamp: Date;
      };
    }
  | {
      type: AppActionTypes.UPDATE_VIEW_START;
    }
  | {
      type: AppActionTypes.UPDATE_VIEW_SUCCESS;
      data: {
        mapData: GeoJSON.FeatureCollection;
        currentTimestamp: Date;
      };
    }
  | AsyncAction;

export type AppDispatch = Dispatch<AppAction>;

function appReducer(state: AppState, action: AppAction) {
  switch (action.type) {
    case AppActionTypes.SET_MAP_REF:
      return {
        ...state,
        map: action.data.map,
        mapStatus: MapStatus.READY,
      };
    case AppActionTypes.UPDATE_VIEW_START:
      return {
        ...state,
        mapStatus: MapStatus.LOADING,
      };
    case AppActionTypes.UPDATE_VIEW_SUCCESS: {
      if (!state.map) {
        return { ...state };
      }

      const { mapData, currentTimestamp } = action.data;

      const stats = calculateStats(mapData);

      const bounds = state.map.getBounds().toArray();
      const [[minX, minY], [maxX, maxY]] = bounds;
      const poly = tBboxPolygon([minX, minY, maxX, maxY]);
      const area = tArea(poly);
      const formattedArea = new Intl.NumberFormat().format(area / 1e6);

      // Update URL params
      const center = state.map.getCenter();
      const zoom = state.map.getZoom();
      updateURLParams({
        lng: center.lng,
        lat: center.lat,
        zoom,
        timestamp: currentTimestamp.toISOString(),
      });

      return {
        ...state,
        formattedArea,
        stats,
        mapData,
        currentTimestamp,
        currentTimestampGeojson: currentTimestamp,
        mapStatus: MapStatus.READY,
      };
    }
    case AppActionTypes.SET_CURRENT_TIMESTAMP: {
      const { currentTimestamp } = action.data;

      const currentTimestampGeojson = state.mapData;
      const stats = calculateStats(currentTimestampGeojson);
      return {
        ...state,
        stats,
        currentTimestamp,
        currentTimestampGeojson,
        mapStatus: MapStatus.READY,
      };
    }
    default:
      return { ...state };
  }
}

type AsyncAction = {
  type: AppActionTypes.UPDATE_VIEW;
  data?: {
    currentTimestamp: Date;
  };
};

const asyncActionHandlers: AsyncActionHandlers<
  Reducer<AppState, AppAction>,
  AsyncAction
> = {
  [AppActionTypes.UPDATE_VIEW]:
    ({ dispatch, getState }) =>
    async (action) => {
      try {
        const state = getState();

        const { map, mapStatus } = state;

        const currentTimestamp =
          action?.data?.currentTimestamp || state.currentTimestamp;

        if (!map || mapStatus !== MapStatus.READY) {
          return;
        }

        dispatch({
          type: AppActionTypes.UPDATE_VIEW_START,
        });

        const mapData = await getFgbData({
          map,
          timestamp: currentTimestamp,
        });

        map.getSource("data").setData(mapData);

        dispatch({
          type: AppActionTypes.UPDATE_VIEW_SUCCESS,
          data: { mapData, currentTimestamp },
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        alert("Unexpected error while loading the map.");
      }
    },
};

export const useAppReducer = () => {
  const [state, dispatch] = useReducerAsync(
    logReducer(appReducer),
    appInitialState,
    asyncActionHandlers,
  );

  useEffect(() => {
    if (state.map && state.initialView) {
      const { lng, lat, zoom } = state.initialView;
      if (lng !== undefined && lat !== undefined && zoom !== undefined) {
        state.map.setView([lat, lng], zoom);
      }
    }
  }, [state.initialView, state.map]);

  return [state, dispatch];
};
