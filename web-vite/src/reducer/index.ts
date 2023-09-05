import { useReducerAsync } from "use-reducer-async";
import logReducer from "./log.ts";

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

export type AppAction = {
  type: AppActionTypes.SET_MAP_REF;
  data: any;
};

export const appInitialState = {
  map: null,
};

export type AppReducer<State, Action> = (state: State, action: Action) => State;

export function appReducer(state: AppState, action: AppAction) {
  switch (action.type) {
    case AppActionTypes.SET_MAP_REF:
      return {
        ...state,
        map: action.data,
      };
    default:
      return state;
  }
}

const asyncActionHandlers = {};

export const useAppReducer = () => {
  return useReducerAsync(
    logReducer(appReducer),
    appInitialState,
    asyncActionHandlers
  );
};
