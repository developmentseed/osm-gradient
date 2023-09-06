import "./index.css";
import { Map } from "./map";
import { useAppReducer } from "./reducer";
import { Stats } from "./stats";

export function App() {
  const [appState, dispatchAppState] = useAppReducer();

  return (
    <>
      <Map appState={appState} dispatchAppState={dispatchAppState} />
      {appState?.stats && <Stats stats={appState.stats} />}
    </>
  );
}
