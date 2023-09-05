import { useReducerAsync } from "use-reducer-async";
import logReducer from "./log.ts";
import { generic as flatgeobuf } from "flatgeobuf";
import { fgBoundingBox } from "../map/utils.ts";

export interface AppState {
  map: any;
}

export enum AppActionTypes {
  LOAD_MAP = "LOAD_MAP",
  LOAD_MAP_START = "LOAD_MAP_START",
  LOAD_MAP_SUCCESS = "LOAD_MAP_SUCCESS",
  LOAD_MAP_ERROR = "LOAD_MAP_ERROR",
  UPDATE_VIEW = "UPDATE_VIEW",
  UPDATE_VIEW_START = "UPDATE_VIEW_START",
  UPDATE_VIEW_SUCCESS = "UPDATE_VIEW_SUCCESS",
  UPDATE_VIEW_ERROR = "UPDATE_VIEW_ERROR",
}

export type AppAction =
  | {
      type: AppActionTypes.LOAD_MAP_START;
      data: {
        map: any;
      };
    }
  | {
      type: AppActionTypes.LOAD_MAP_SUCCESS;
    };

export const appInitialState = {
  map: undefined,
};

export type AppReducer<State, Action> = (state: State, action: Action) => State;

function appReducer(state: AppState, action: AppAction) {
  switch (action.type) {
    case AppActionTypes.LOAD_MAP_START:
      return {
        ...state,
        map: action.data.map,
      };
    case AppActionTypes.LOAD_MAP_SUCCESS:
      return {
        ...state,
      };
    default:
      return state;
  }
}

const asyncActionHandlers: any = {
  [AppActionTypes.LOAD_MAP]:
    ({ dispatch, getState }) =>
    async (action: AppAction) => {
      try {
        const map = action.data;
        console.log({ flatgeobuf });

        dispatch({
          type: AppActionTypes.LOAD_MAP_START,
          data: { map },
        });

        let i = 0;
        const fc = { type: "FeatureCollection", features: [] };
        let iter = await flatgeobuf.deserialize(
          "public/sample-data.fgb",
          fgBoundingBox(map)
        );
        for await (let feature of iter) {
          if (
            feature.properties.type !== "relation" &&
            (feature.properties.changeType === "added" ||
              feature.properties.changeType === "modifiedNew" ||
              feature.properties.changeType === "deletedNew")
          ) {
            fc.features.push({ ...feature, id: i });
            i += 1;
          }
        }

        console.log(fc);

        // const stats = calculateStats(fc);

        dispatch({
          type: AppActionTypes.LOAD_MAP_SUCCESS,
        });
      } catch (error) {
        console.log({ error });
        alert(
          "Unexpected error while loading the map, please see console log."
        );
      }
    },
};

export const useAppReducer = () => {
  return useReducerAsync(
    logReducer(appReducer),
    appInitialState,
    asyncActionHandlers
  );
};
