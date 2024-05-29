import type { ComponentChildren } from "preact";

interface LayoutProps {
  children: ComponentChildren;
}
export function Layout(props: LayoutProps) {
  return <div class="layout">{props.children}</div>;
}
