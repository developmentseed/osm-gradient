import { useState } from "preact/hooks";

// TODO - Fix accessibility issues in this file and remove the following
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
interface PanelProps {
  children: any;
}
export function Panel(props: PanelProps) {
  const [openPanel, setOpenPanel] = useState(false);
  return (
    <div class={openPanel ? "panel open" : "panel"}>
      <span onClick={() => setOpenPanel(!openPanel)} class="panel__dragger">
        -
      </span>
      {props.children}
    </div>
  );
}
