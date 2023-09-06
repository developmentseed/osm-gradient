import { useReducerAsync } from "use-reducer-async";
import logReducer from "./log.ts";
import { getFgbData } from "../map/utils.ts";

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
      data: {
        stats: any;
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
        stats: any;
      };
    };

export const appInitialState = {
  map: undefined,
};

export type AppReducer<State, Action> = (state: State, action: Action) => State;

function appReducer(state: AppState, action: AppAction) {
  const nextState = { ...state };
  switch (action.type) {
    case AppActionTypes.LOAD_MAP_START:
      return {
        ...nextState,
        map: action.data.map,
      };
    case AppActionTypes.LOAD_MAP_SUCCESS:
      return {
        ...nextState,
        stats: action.data.stats,
      };
    case AppActionTypes.UPDATE_VIEW_SUCCESS:
      return {
        ...nextState,
        stats: action.data.stats,
      };
    default:
      return nextState;
  }
}

const asyncActionHandlers: any = {
  [AppActionTypes.LOAD_MAP]:
    ({ dispatch, getState }) =>
    async (action: AppAction) => {
      try {
        const map = action.data;

        dispatch({
          type: AppActionTypes.LOAD_MAP_START,
          data: { map },
        });

        const { geojson, stats } = await getFgbData(map);

        map.getSource("data").setData(geojson);

        dispatch({
          type: AppActionTypes.LOAD_MAP_SUCCESS,
          data: { stats },
        });
      } catch (error) {
        console.log(error);
        alert(
          "Unexpected error while loading the map, please see console log."
        );
      }
    },
  [AppActionTypes.UPDATE_VIEW]:
    ({ dispatch, getState }: any) =>
    async (action: AppAction) => {
      try {
        const map = getState().map;

        dispatch({
          type: AppActionTypes.UPDATE_VIEW_START,
        });

        const { geojson, stats } = await getFgbData(map);

        map.getSource("data").setData(geojson);

        dispatch({
          type: AppActionTypes.UPDATE_VIEW_SUCCESS,
          data: { stats },
        });
      } catch (error) {
        console.log(error);
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
