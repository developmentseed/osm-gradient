import { Header } from "./components/header";
import { Layout } from "./components/layout";
import { PanelInputs } from "./inputs";
import { Map } from "./map";
import { Panel } from "./panel";
import { MapStatus, useAppReducer } from "./reducer";
import { Stats } from "./stats";
import get from "lodash.get";

export function App() {
  const [appState, dispatchAppState] = useAppReducer();

  const { mapStatus, stats } = appState;

  const isLoading = mapStatus === MapStatus.LOADING;
  const timestamps = get(stats, "timestamps", []);

  return (
    <Layout>
      <Header />
      <Panel>
        <PanelInputs
          isLoading={isLoading}
          timestamps={timestamps}
          dispatchAppState={dispatchAppState}
        />
        <Stats
          stats={appState.stats}
          currentTimestamp={appState.currentTimestamp}
          loading={mapStatus === MapStatus.LOADING}
        />
      </Panel>
      <Map appState={appState} dispatchAppState={dispatchAppState} />
      {mapStatus === MapStatus.LOADING && (
        <div style={{ position: "absolute" }}>Loading...</div>
      )}
    </Layout>
  );
}
