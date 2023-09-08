export function PanelInputs() {
  return (
    <article>
      <section>
        <h3>Area of Interest (AOI)</h3>
        <small>Zoom and pan the map to set the AOI for stats </small>
        <p>
          Currently selected: <strong>{2333}m&sup2;</strong>
        </p>
      </section>
      <section>
        <h3>Time Period</h3>
        <p><small>Select one hour from: </small></p>
        <input type="date" />
      </section>
    </article>
  );
}
