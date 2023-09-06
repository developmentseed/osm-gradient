import { useReducerAsync } from "use-reducer-async";
import logReducer from "./log.ts";
import { getFgbData } from "../map/utils.ts";

export interface AppState {
  map: any;
}

export enum AppActionTypes {
  SET_MAP_REF = "SET_MAP_REF",
  UPDATE_VIEW = "UPDATE_VIEW",
  UPDATE_VIEW_START = "UPDATE_VIEW_START",
  UPDATE_VIEW_SUCCESS = "UPDATE_VIEW_SUCCESS",
  UPDATE_VIEW_ERROR = "UPDATE_VIEW_ERROR",
}

export type AppAction =
  | {
      type: AppActionTypes.SET_MAP_REF;
      data: {
        map: any;
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
    case AppActionTypes.SET_MAP_REF:
      return {
        ...nextState,
        map: action.data.map,
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
  [AppActionTypes.UPDATE_VIEW]:
    ({ dispatch, getState }: any) =>
    async () => {
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
