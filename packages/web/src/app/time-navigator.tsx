import { addHours, addDays, subDays, subHours } from "date-fns";
import { AppActionTypes, AppDispatch, AppState } from "./reducer";
import type { ComponentChildren } from "preact";

function LoadingSkeleton() {
  return (
    <div class="carto__slider--loading">
      <p>Loading...</p>
    </div>
  );
}

const TimeChangeButton = ({
  dispatchAppState,
  nextTimestamp,
  children,
}: {
  dispatchAppState: AppDispatch;
  nextTimestamp: Date;
  children: ComponentChildren;
}) => (
  <button
    onClick={(e) => {
      e.preventDefault();
      dispatchAppState({
        type: AppActionTypes.UPDATE_VIEW,
        data: {
          currentTimestamp: nextTimestamp,
        },
      });
    }}
    class="carto__slider--button"
  >
    {children}
  </button>
);

function TimeNavigator({
  currentTimestamp,
  isLoading,
  dispatchAppState,
}: {
  currentTimestamp: Date;
  isLoading: boolean;
  timestamps: string[];
  dispatchAppState: AppDispatch;
  appState: AppState;
}) {
  return (
    <section class="carto__slider--wrapper">
      <div class="carto__slider--heading">
        <h4>Change Timeline</h4>
      </div>
      <div class="carto__slider">
        <div class="carto__slider--tools">
          <p>
            {!isLoading && currentTimestamp ? (
              new Date(currentTimestamp).toUTCString()
            ) : (
              <LoadingSkeleton />
            )}
          </p>
          <TimeChangeButton
            dispatchAppState={dispatchAppState}
            nextTimestamp={subDays(currentTimestamp, -1)}
          >
            ← Day
          </TimeChangeButton>
          <TimeChangeButton
            dispatchAppState={dispatchAppState}
            nextTimestamp={subHours(currentTimestamp, -1)}
          >
            ← Hour
          </TimeChangeButton>
          <TimeChangeButton
            dispatchAppState={dispatchAppState}
            nextTimestamp={addHours(currentTimestamp, 1)}
          >
            Hour →
          </TimeChangeButton>
          <TimeChangeButton
            dispatchAppState={dispatchAppState}
            nextTimestamp={addDays(currentTimestamp, 1)}
          >
            Day →
          </TimeChangeButton>
        </div>
      </div>
    </section>
  );
}

export default TimeNavigator;
