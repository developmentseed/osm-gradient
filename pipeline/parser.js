const adiffParser = require('osm-adiff-parser');
const changesetParser = require('real-changesets-parser');
const fs = require('fs');

// Read the file
const processFile = (fileName, callback) => {
  fs.readFile(fileName, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading the file:', err);
      return;
    }
    let DONE = false;
    adiffParser(data, null, (err, result) => {
      if (DONE) { return };
      DONE = true;
      // console.log('keys', Object.keys(result));
      const featureCollection = {
        'type': 'FeatureCollection',
        'features': []
      };
      Object.keys(result).forEach(changesetId => {
        result[changesetId].forEach(element => {
          const change = changesetParser.elementParser(element);
          // console.log('change', change);
          featureCollection.features = featureCollection.features.concat(change);
          // console.log('change', change);
        });
      });

      // console.log(JSON.stringify(featureCollection, null, 2));
      callback(null, featureCollection);
      // changeset = changesetParser(result);
      // console.log('changeset', changeset);
      // return result;
    });
  });
}

module.exports = processFile;