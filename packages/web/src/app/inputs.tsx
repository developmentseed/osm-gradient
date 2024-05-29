interface PanelInputsProps {
  formattedArea: string;
}

export function PanelInputs(props: PanelInputsProps) {
  const { formattedArea } = props;

  return (
    <article>
      <section>
        <h3>Area of Interest (AOI)</h3>
        <small>Zoom and pan the map to set the AOI for stats </small>
        <p>
          Currently selected: <strong>{formattedArea || "-"} km&sup2;</strong>
        </p>
      </section>
    </article>
  );
}
