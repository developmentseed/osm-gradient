import { useReducer } from "preact/hooks";
import "./app.css";
import { Map } from "./map";
import { appInitialState, appReducer } from "./reducer";

export function App() {
  const [appState, dispatchAppState] = useReducer(appReducer, appInitialState);

  return (
    <>
      <Map appState={appState} dispatchAppState={dispatchAppState} />
    </>
  );
}
