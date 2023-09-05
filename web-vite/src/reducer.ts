export interface AppState {
  map: any;
}

export enum AppActionTypes {
  SET_MAP_REF = "SET_MAP_REF",
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
