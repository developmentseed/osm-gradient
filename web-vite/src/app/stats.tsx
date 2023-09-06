export function Stats({ stats, loading }) {
  if (loading || !stats){
    return (
      <article class="stats">
        <div class="stats__heading">
          <h2>Results</h2>
          <p class="loading" />
        </div>
        <section >
          <h3>Feature Stats</h3>
          <table class="loading__wrapper">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Added</th>
                <th>Modified</th>
                <th>Deleted</th>
              </tr>
            </thead>
            <tbody>
              {Array.from(Array(3).keys()).map((x) => {
                return (<tr key={x}>
                  <td class="loading" />
                  <td class="loading" />
                  <td class="loading" />
                  <td class="loading" />
                </tr>)
              })}
            </tbody>
          </table>
        </section>
        <section >
          <h3>Tag Stats</h3>
          <table class="loading__wrapper">
            <thead>
              <tr>
                <th>Tag</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {Array.from(Array(12).keys()).map((x) => {
                return (<tr key={x}>
                  <td class="loading" />
                  <td class="loading" />
                </tr>)
              })}
            </tbody>
          </table>
        </section>

      </article>
    )
  }
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

  return (
    <article class="stats">
      <div class="stats__heading">
        <h2>Results</h2>
        <p>
          <small>As of: {new Date().toLocaleDateString()}</small>
        </p>
      </div>
      <section>
        <h3>Feature Stats</h3>
        <table>
          <thead>
            <tr>
              <th>Feature</th>
              <th>Added</th>
              <th>Modified</th>
              <th>Deleted</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Buildings</td>
              <td>{stats.buildingsAdded}</td>
              <td>{stats.buildingsModified}</td>
              <td>{stats.buildingsDeleted} </td>
            </tr>
            <tr>
              <td>Highways</td>
              <td>{stats.highwaysAdded} </td>
              <td>{stats.highwaysModified} </td>
              <td>{stats.highwaysDeleted} </td>
            </tr>
            <tr>
              <td>Other</td>
              <td>{stats.otherAdded} </td>
              <td>{stats.otherModified} </td>
              <td>{stats.otherDeleted} </td>
            </tr>
          </tbody>
        </table>
      </section>
      <section>
        <h3>Tag Stats</h3>
        <table>
          <thead>
            <tr>
              <th>Tag</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            {sortedTags.map((k) => (
              <tr>
                <td>{k[0]}</td>
                <td>{k[1]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section>
        <h3>User Stats</h3>
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Features</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((k) => (
              <tr>
                <td>{k[0]}</td>
                <td>{k[1]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </article>
  );
}
