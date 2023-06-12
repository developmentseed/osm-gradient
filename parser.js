const adiffParser = require('osm-adiff-parser');
const changesetParser = require('real-changesets-parser');
const fs = require('fs');

// Read the file name from the command-line argument
const fileName = process.argv[2];

// Read the file
fs.readFile(fileName, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the file:', err);
    return;
    }

    result = adiffParser(data, null, (err, result) => {
        console.log(result);
        return result;
    });

    changeset = changesetParser(result)
    console.log(changeset)
});
