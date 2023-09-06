import { AppAction, AppState } from ".";

export default function logReducer(reducer: any) {
  /* eslint-disable no-console */
  return (state: AppState, action: AppAction) => {
    const nextState = reducer(state, action);

    console.log(state, action);
    console.groupCollapsed(action.type);
    console.log("%c%s", "color: gray; font-weight: bold", "prev state ", state);
    console.log("%c%s", "color: cyan; font-weight: bold", "action ", action);
    console.log(
      "%c%s",
      "color: green; font-weight: bold",
      "next state ",
      nextState
    );
    console.groupEnd();
  };
  /* eslint-enable no-console */
}
