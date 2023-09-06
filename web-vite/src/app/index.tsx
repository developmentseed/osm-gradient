import "./index.css";
import { Map } from "./map";
import { MapStatus, useAppReducer } from "./reducer";
import { Stats } from "./stats";

export function App() {
  const [appState, dispatchAppState] = useAppReducer();

  const { mapStatus, stats } = appState;

  return (
    <>
      <Map appState={appState} dispatchAppState={dispatchAppState} />
      {mapStatus === MapStatus.READY && stats && (
        <Stats stats={appState.stats} />
      )}
      {mapStatus === MapStatus.LOADING && <div>Loading...</div>}
    </>
  );
}
