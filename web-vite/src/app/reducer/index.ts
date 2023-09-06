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

        dispatch({
          type: AppActionTypes.LOAD_MAP_START,
          data: { map },
        });

        const fc = await getFgbData(map);

        map.getSource("data").setData(fc);

        dispatch({
          type: AppActionTypes.LOAD_MAP_SUCCESS,
        });
      } catch (error) {
        console.log(error);
        alert(
          "Unexpected error while loading the map, please see console log."
        );
      }
    },
  [AppActionTypes.UPDATE_VIEW]:
    ({ dispatch, getState }) =>
    async (action: AppAction) => {
      try {
        const map = action.data;

        const state = getState();
        console.log(state);

        dispatch({
          type: AppActionTypes.UPDATE_VIEW_START,
          data: { map },
        });

        const fc = await getFgbData(map);

        map.getSource("data").setData(fc);

        dispatch({
          type: AppActionTypes.UPDATE_VIEW_SUCCESS,
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
