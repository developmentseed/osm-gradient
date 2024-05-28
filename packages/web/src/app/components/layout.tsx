interface LayoutProps {
  children: any;
}
export function Layout(props: LayoutProps){
  return (
    <div class="layout">
      {props.children}
    </div>
  )
}