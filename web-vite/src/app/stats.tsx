export function Stats({ stats }) {
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
    <div class="stats">
      <h2>Feature Stats</h2>
      <table>
        <tbody>
          <tr>
            <td>Buildings</td>
            <td>{stats.buildingsAdded} added</td>
            <td>{stats.buildingsModified} modified</td>
            <td>{stats.buildingsDeleted} deleted</td>
          </tr>
          <tr>
            <td>Highways</td>
            <td>{stats.highwaysAdded} added</td>
            <td>{stats.highwaysModified} modified</td>
            <td>{stats.highwaysDeleted} deleted</td>
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
          {sortedTags.map((k) => (
            <tr>
              <td>{k[0]}</td>
              <td>{k[1]}</td>
            </tr>
          ))}
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
          {sortedUsers.map((k) => (
            <tr>
              <td>{k[0]}</td>
              <td>{k[1]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
