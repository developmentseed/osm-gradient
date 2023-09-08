const adiffParser = require("osm-adiff-parser");
const changesetParser = require("real-changesets-parser");
const fs = require("fs");

// Read the file name from the command-line argument
const fileName = process.argv[2];

// Read the file
fs.readFile(fileName, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading the file:", err);
    return;
  }
  let ranOnce = false;
  adiffParser(data, null, (err, result) => {
    if (ranOnce) {
      return;
    }
    ranOnce = true;
    Object.keys(result).forEach((changesetId) => {
      result[changesetId].forEach((element) => {
        const change = changesetParser.elementParser(element);

        // do some validation here
        console.log(JSON.stringify(change));
      });
    });
    console.log(JSON.stringify(featureCollection));
  });
});
