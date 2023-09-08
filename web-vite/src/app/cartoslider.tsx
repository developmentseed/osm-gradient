import ReactSlider from 'react-slider';

interface CartoSliderProps {
  lastTimestampIndex: any;
  isLoading: any;
  timestamps: any;
  dispatchAppState: any;
  appState: any;
}

export function CartoSlider(props: CartoSliderProps) {
  const {
    lastTimestampIndex,
    isLoading,
    timestamps,
    dispatchAppState,
    appState,
  } = props;
  return (
    <section class="carto__slider--wrapper">
      <div class="carto__slider--heading">
        <h4>Changeset Animation</h4>
      </div>
      <div class="carto__slider">
        <div class="carto__slider--tools">
          <p>
            {appState.currentTimestamp &&
              new Date(appState.currentTimestamp).toLocaleString()}
          </p>
        </div>
        <ReactSlider
          className="carto--slider"
          markClassName="slider--mark"
          min={0}
          max={lastTimestampIndex || 5}
          defaultValue={lastTimestampIndex || 5}
          thumbClassName="slider--thumb"
          trackClassName="slider--track"
          disabled={isLoading}
          onChange={(value: number) => {
            dispatchAppState({
              type: 'SET_CURRENT_TIMESTAMP',
              data: {
                currentTimestamp: timestamps[value],
              },
            });
          }}
        />
      </div>
    </section>
  );
}
