import { useState } from 'preact/hooks';

interface PanelProps {
  children: any;
}
export function Panel(props: PanelProps){
  const [openPanel, setOpenPanel] = useState(false)
  return (
    <div  class={openPanel ? "panel open" : "panel"}>
      <span onClick={() => setOpenPanel(!openPanel)} class="panel__dragger">-</span>
      {props.children}
    </div>
  )
}