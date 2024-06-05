import { useRef } from "preact/hooks";
export function Header() {
  const ref = useRef<HTMLDialogElement>();
  return (
    <div class="page-header">
      <h1 class="page-header__headline">Gr&delta;dient</h1>
      <dialog
        ref={ref}
        onCancel={(e) => e.preventDefault()}
        class="dialog dialog--about"
      >
        <div class="dialog--header">
          <h2>About OSM Gradient</h2>
          <button
            class="dialog__close-button"
            type="button"
            title="Close Modal"
            onClick={() => ref.current.close()}
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
              class="feather feather-x"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <small>
          Visualize OpenStreetMap features created, modified or deleted every hour
          using change data prepared by OSMCha as a FlatGeobuf. This visualization
          does not use a server.
        </small>
      </dialog>
      <button
        class="dialog__open-button"
        type="button"
        title="Open Modal"
        onClick={() => ref.current.showModal()}
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
          class="feather feather-info"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        About
      </button>
    </div>
  );
}
