import "./index.css";
import { Map } from "./map";
import { useAppReducer } from "./reducer";

export function App() {
  const [appState, dispatchAppState] = useAppReducer();

  return (
    <>
      <Map appState={appState} dispatchAppState={dispatchAppState} />
    </>
  );
}
