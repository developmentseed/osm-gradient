const fs = require("fs");
const adiffParser = require("./parsers/adiffParser");
const elementParser = require("./parsers/element");
var featureCollection = require("@turf/helpers").featureCollection;
const { prop, pipe, flatten } = require("ramda");

const changesetParser = pipe(
  prop(["elements"]),
  (array) => array.map(elementParser),
  flatten,
  featureCollection
);

// Read the file name from the command-line argument
const fileName = process.argv[2];

// Read the file
async function main() {
  try {
    const data = fs.readFileSync(fileName);
    const adiff = await adiffParser(data);
    const featureCollection = {
      type: "FeatureCollection",
      features: [],
    };
    const featureCollections = Object.keys(adiff).map((key) => {
      const changeset = adiff[key];
      const fc = changesetParser(changeset);
      return fc;
    });
    featureCollection.features = featureCollections
      .map(prop("features"))
      .flat();

    console.log(JSON.stringify(featureCollection, null, 2));
  } catch (err) {
    console.error("Error reading the file:", err);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => process.exit(1));
