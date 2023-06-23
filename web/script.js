import { h, render } from "https://esm.sh/preact";
import htm from "https://esm.sh/htm";
// Initialize htm with Preact
const html = htm.bind(h);

function StatsComponent({ stats }) {
  let sortedUsers = [];
  let sortedTags = [];
  Object.keys(stats.users).forEach((user) => {
    sortedUsers.push([user, stats.users[user]]);
  });
  sortedUsers.sort((a, b) => {
    return b[1] - a[1];
  });

  Object.keys(stats.tags).forEach((tags) => {
    sortedTags.push([tags, stats.tags[tags]]);
  });
  sortedTags.sort((a, b) => {
    return b[1] - a[1];
  });

  return html`
    <div class="stats">
      <h2>Feature Stats</h2>
      <table>
        <tbody>
          <tr>
            <td>Buildings</td>
            <td>${stats.buildingsAdded} added</td>
            <td>${stats.buildingsModified} modified</td>
            <td>${stats.buildingsDeleted} deleted</td>
          </tr>
          <tr>
            <td>Highways</td>
            <td>${stats.highwaysAdded} added</td>
            <td>${stats.highwaysModified} modified</td>
            <td>${stats.highwaysDeleted} deleted</td>
          </tr>
        </tbody>
      </table>

      <h2>Tag Stats</h2>
      <table>
        <thead>
          <tr>
            <th>Tag</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          ${sortedTags.map(
            (k) => html`
              <tr>
                <td>${k[0]}</td>
                <td>${k[1]}</td>
              </tr>
            `
          )}
        </tbody>
      </table>
      <h2>User Stats</h2>
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Features</th>
          </tr>
        </thead>
        <tbody>
          ${sortedUsers.map(
            (k) => html`
              <tr>
                <td>${k[0]}</td>
                <td>${k[1]}</td>
              </tr>
            `
          )}
        </tbody>
      </table>
    </div>
  `;
}

function calculateStats(features) {
  const stats = {
    tags: {},
    buildingsAdded: 0,
    buildingsModified: 0,
    buildingsDeleted: 0,
    highwaysAdded: 0,
    highwaysModified: 0,
    highwaysDeleted: 0,
    users: {},
  };
  for (let feature of features.features) {
    const changeType = feature.properties.changeType;
    if (
      changeType === "added" ||
      changeType === "modifiedNew" ||
      changeType === "deletedNew"
    ) {
      const user = feature.properties.user;
      const tags = JSON.parse(feature.properties.tags);

      if (changeType === "added") {
        if (tags.building) {
          stats.buildingsAdded += 1;
        }
        if (tags.highway) {
          stats.highwaysAdded += 1;
        }
      }
      if (changeType === "modifiedNew") {
        if (tags.building) {
          stats.buildingsModified += 1;
        }
        if (tags.highway) {
          stats.highwaysModified += 1;
        }
      }
      if (changeType === "deletedNew") {
        if (tags.building) {
          stats.buildingsDeleted += 1;
        }
        if (tags.highway) {
          stats.highwaysDeleted += 1;
        }
      }

      Object.keys(tags).forEach((k) => {
        stats.tags[k] = (stats.tags[k] || 0) + 1;
      });
      stats.users[user] = (stats.users[user] || 0) + 1;
    }
  }
  return stats;
}

document.addEventListener("DOMContentLoaded", async () => {
  // basic MapLibre map
  const map = new maplibregl.Map({
    container: "map",
    style: "https://demotiles.maplibre.org/style.json",
    center: [0, 30],
    zoom: 2,
    maxZoom: 18,
    minZoom: 0,
  });

  // convert the rect into the format flatgeobuf expects
  function fgBoundingBox() {
    const { lng, lat } = map.getCenter();
    const { _sw, _ne } = map.getBounds();
    const distanceX =
      Math.min(Math.abs(_sw.lng - lng), Math.abs(_ne.lng - lng)) * 0.9;
    const distanceY =
      Math.min(Math.abs(_sw.lat - lat), Math.abs(_ne.lat - lat)) * 0.9;
    return {
      minX: lng - distanceX,
      minY: lat - distanceY,
      maxX: lng + distanceX,
      maxY: lat + distanceY,
    };
  }

  function getRect() {
    const bbox = fgBoundingBox();
    const coords = [
      [
        [bbox.minX, bbox.minY],
        [bbox.maxX, bbox.minY],
        [bbox.maxX, bbox.maxY],
        [bbox.minX, bbox.maxY],
        [bbox.minX, bbox.minY],
      ],
    ];
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: { type: "Polygon", coordinates: coords },
        },
      ],
    };
  }

  async function updateResults() {
    let i = 0;
    const fc = { type: "FeatureCollection", features: [] };
    let iter = flatgeobuf.deserialize("/test/output.fgb", fgBoundingBox());
    for await (let feature of iter) {
      if (
        feature.properties.type !== "relation" &&
        (feature.properties.changeType === "added" ||
          feature.properties.changeType === "modifiedNew" ||
          feature.properties.changeType === "deletedNew")
      ) {
        fc.features.push({ ...feature, id: i });
        i += 1;
      }
    }

    const stats = calculateStats(fc);
    render(
      html`<${StatsComponent} stats=${stats} />`,
      document.getElementById("stats")
    );
    map.getSource("data").setData(fc);
  }

  map.on("load", () => {
    map.addSource("data", {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] },
    });
    map.addLayer({
      id: "data-point",
      type: "circle",
      source: "data",
      paint: {
        "circle-radius": 6,
        "circle-color": "#B42222",
      },
      filter: ["==", "$type", "Point"],
    });
    map.addLayer({
      id: "data-fill",
      type: "fill",
      source: "data",
      filter: ["==", "$type", "Polygon"],
      paint: {
        "fill-color": "#FEB24C",
      },
    });
    map.addLayer({
      id: "data-line",
      type: "line",
      source: "data",
      filter: ["==", "$type", "LineString"],
      paint: {
        "line-color": "#800026",
        "line-opacity": 0.8,
        "line-width": 2,
      },
    });

    map.addSource("rectangle", {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] },
    });
    map.addLayer({
      id: "rectangle",
      type: "line",
      source: "rectangle",
      paint: {
        "line-color": "#0000FF",
        "line-opacity": 0.9,
        "line-width": 3,
      },
    });

    function onClick(e) {
      const props = e.features[0].properties;
      let tags = "";
      let tagObject = JSON.parse(props.tags);
      for (const [key, value] of Object.entries(tagObject)) {
        tags = tags + "<dt>" + key + "=" + value + "</dt>";
      }
      const html = `<dl><dt><b>action:</b> ${props.action}</dt>
      <dt><b>id:</b> ${props.id}</dt>
      <dt><b>user:</b> ${props.user}<dt>
      <br />
      ${tags}
      </dl>`;
      new maplibregl.Popup().setLngLat(e.lngLat).setHTML(html).addTo(map);
    }

    map.on("click", "data-point", onClick);
    map.on("click", "data-fill", onClick);
    map.on("click", "data-line", onClick);

    // if the user is panning around alot, only update once per second max
    updateResults = _.throttle(updateResults, 1000);

    // show a rectangle corresponding to our bounding box
    map.getSource("rectangle").setData(getRect());

    // show results based on the initial map
    updateResults();

    // ...and update the results whenever the map moves
    map.on("moveend", function (s) {
      map.getSource("rectangle").setData(getRect());
      updateResults();
    });
  });
});
