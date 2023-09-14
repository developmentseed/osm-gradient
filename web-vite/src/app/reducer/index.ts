import { useReducerAsync } from "use-reducer-async";
import logReducer from "./log.ts";
import { calculateStats, getFgbData } from "../map/utils.ts";
import tArea from "@turf/area";
import tBboxPolygon from "@turf/bbox-polygon";

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

export type AppReducer<State, Action> = (state: State, action: Action) => State;
/* eslint-enable no-unused-vars */

export interface AppState {
  map: any;
  mapStatus: MapStatus;
  geojson?: any;
  currentTimestampGeojson?: any;
}

export type AppAction =
  | {
      type: AppActionTypes.SET_MAP_REF;
      data: {
        map: any;
      };
    }
  | {
      type: AppActionTypes.SET_CURRENT_TIMESTAMP;
      data: {
        currentTimestamp: string;
      };
    }
  | {
      type: AppActionTypes.UPDATE_VIEW;
    }
  | {
      type: AppActionTypes.UPDATE_VIEW_START;
    }
  | {
      type: AppActionTypes.UPDATE_VIEW_SUCCESS;
      data: {
        geojson: any;
        timestamps: string[];
      };
    };

export const appInitialState = {
  map: undefined,
  mapStatus: MapStatus.IDLE,
  geojson: {
    type: "FeatureCollection",
    features: [],
  },
};

function applyTimestampFilter(geojson: any, timestamp: string) {
  return {
    type: "FeatureCollection",
    features: geojson.features.filter(
      (f: any) => f.properties.timestamp === timestamp,
    ),
  };
}

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
      const { geojson, timestamps } = action.data;
      const currentTimestamp = timestamps[timestamps.length - 1];
      const currentTimestampGeojson = applyTimestampFilter(
        geojson,
        currentTimestamp,
      );
      const stats = calculateStats(currentTimestampGeojson);

      const bounds = state.map.getBounds().toArray();
      const [[minX, minY], [maxX, maxY]] = bounds;
      const poly = tBboxPolygon([minX, minY, maxX, maxY]);
      const area = tArea(poly);
      const formattedArea = new Intl.NumberFormat().format(area / 1e6);

      return {
        ...state,
        formattedArea,
        stats,
        geojson,
        timestamps,
        currentTimestamp,
        currentTimestampGeojson,
        mapStatus: MapStatus.READY,
      };
    }
    case AppActionTypes.SET_CURRENT_TIMESTAMP: {
      const { currentTimestamp } = action.data;
      const currentTimestampGeojson = applyTimestampFilter(
        state.geojson,
        currentTimestamp,
      );
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

const asyncActionHandlers: any = {
  [AppActionTypes.UPDATE_VIEW]:
    ({ dispatch, getState }: any) =>
    async () => {
      try {
        const { map, mapStatus } = getState();

        // Only update the view if the map is ready
        if (mapStatus !== MapStatus.READY) {
          return;
        }

        dispatch({
          type: AppActionTypes.UPDATE_VIEW_START,
        });

        const { geojson, timestamps } = await getFgbData(map);

        map.getSource("data").setData(geojson);

        dispatch({
          type: AppActionTypes.UPDATE_VIEW_SUCCESS,
          data: { geojson, timestamps },
        });
      } catch (error) {
        console.log(error);
        alert(
          "Unexpected error while loading the map, please see console log.",
        );
      }
    },
};

export const useAppReducer = () => {
  return useReducerAsync(
    logReducer(appReducer),
    appInitialState,
    asyncActionHandlers,
  );
};
