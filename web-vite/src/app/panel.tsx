interface PanelProps {
  children: any;
}
export function Panel(props: PanelProps){
  return (
    <div class="panel">
      {props.children}
    </div>
  )
}