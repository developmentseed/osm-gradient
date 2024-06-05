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
        <p>
          {!isLoading && currentTimestamp ? (
            new Date(currentTimestamp).toUTCString()
          ) : (
            <LoadingSkeleton />
          )}
        </p>
      </div>
      <div class="carto__slider--tools">
        <TimeChangeButton
          dispatchAppState={dispatchAppState}
          nextTimestamp={subDays(currentTimestamp, 1)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="feather feather-chevrons-left"
          >
            <polyline points="11 17 6 12 11 7" />
            <polyline points="18 17 13 12 18 7" />
          </svg>
          Day
        </TimeChangeButton>
        <TimeChangeButton
          dispatchAppState={dispatchAppState}
          nextTimestamp={subHours(currentTimestamp, 1)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="feather feather-chevron-left"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>{" "}
          Hour
        </TimeChangeButton>
        <TimeChangeButton
          dispatchAppState={dispatchAppState}
          nextTimestamp={addHours(currentTimestamp, 1)}
        >
          Hour{" "}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="feather feather-chevron-right"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </TimeChangeButton>
        <TimeChangeButton
          dispatchAppState={dispatchAppState}
          nextTimestamp={addDays(currentTimestamp, 1)}
        >
          Day{" "}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="feather feather-chevrons-right"
          >
            <polyline points="13 17 18 12 13 7" />
            <polyline points="6 17 11 12 6 7" />
          </svg>
        </TimeChangeButton>
      </div>
    </section>
  );
}

export default TimeNavigator;
