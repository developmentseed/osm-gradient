interface PanelInputsProps {
  formattedArea: string;
}

export function PanelInputs(props: PanelInputsProps) {
  const { formattedArea } = props;

  return (
    <article>
      <section>
        <small>
          <div>
            Visualize OpenStreetMap features created, modified or deleted every
            hour using change data prepared by OSMCha as a FlatGeobuf. This
            visualization does not use a server.
          </div>
        </small>
      </section>
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
