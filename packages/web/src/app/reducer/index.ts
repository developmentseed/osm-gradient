import { AsyncActionHandlers, useReducerAsync } from "use-reducer-async";
import logReducer from "./log.ts";
import { calculateStats } from "../map/utils.ts";
import tArea from "@turf/area";
import tBboxPolygon from "@turf/bbox-polygon";
import { getFgbData } from "../utils/get-fgb-data.ts";
import { Map } from "maplibre-gl";
import { Dispatch, Reducer } from "preact/hooks";

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

export type AppReducer<State, Action> = (state: State, action: Action) => State;
/* eslint-enable no-unused-vars */

export interface AppState {
  map?: Map;
  mapStatus: MapStatus;
  mapData: GeoJSON.FeatureCollection;
  currentTimestamp: Date;
  timestamps: string[];
}

const appInitialState: AppState = {
  map: undefined,
  mapStatus: MapStatus.IDLE,
  mapData: {
    type: "FeatureCollection",
    features: [],
  },
  currentTimestamp: new Date(availableTimestamps[2]),
  timestamps: [...availableTimestamps],
};

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
  return useReducerAsync(
    logReducer(appReducer),
    appInitialState,
    asyncActionHandlers,
  );
};
