import { Header } from "./components/header";
import { Layout } from "./components/layout";
import { PanelInputs } from "./inputs";
import { Map } from "./map";
import { Panel } from "./panel";
import { MapStatus, useAppReducer } from "./reducer";
import { Stats } from "./stats";
import { CartoSlider } from "./cartoslider";

export function App() {
  const [appState, dispatchAppState] = useAppReducer();

  const { mapStatus, timestamps, currentTimestamp, formattedArea } = appState;

  const isLoading = mapStatus === MapStatus.LOADING;

  return (
    <Layout>
      <Header />
      <Panel>
        <PanelInputs area={formattedArea} />
        <Stats
          stats={appState.stats}
          currentTimestamp={appState.currentTimestamp}
          loading={mapStatus === MapStatus.LOADING}
        />
      </Panel>
      <main class="carto">
        <Map appState={appState} dispatchAppState={dispatchAppState} />
        <CartoSlider
          currentTimestamp={currentTimestamp}
          isLoading={isLoading}
          timestamps={timestamps}
          dispatchAppState={dispatchAppState}
          appState={appState}
        />
      </main>
      {mapStatus === MapStatus.LOADING && (
        <div style={{ position: "absolute" }}>Loading...</div>
      )}
    </Layout>
  );
}
