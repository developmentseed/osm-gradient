import { Header } from './components/header';
import { Layout } from './components/layout';
import { PanelInputs } from './inputs';
import { Map } from './map';
import { Panel } from './panel';
import { MapStatus, useAppReducer } from './reducer';
import { Stats } from './stats';

export function App() {
  const [appState, dispatchAppState] = useAppReducer();

  const { mapStatus, stats } = appState;

  return (
    <Layout>
      <Header />
      <Panel>
        <PanelInputs />
        <Stats stats={stats} loading={mapStatus === MapStatus.LOADING} />
      </Panel>
      <Map appState={appState} dispatchAppState={dispatchAppState} />
      {mapStatus === MapStatus.LOADING && (
        <div style={{ position: 'absolute' }}>Loading...</div>
      )}
    </Layout>
  );
}
