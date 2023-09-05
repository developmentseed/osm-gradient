const maxRetries = 10;
const retryInterval = 5000;
const fs = require("fs");
const axios = require("axios");

const OSC_SOURCE_URL =
  "http://s3-eu-west-1.amazonaws.com/overpass-db-eu-west-1/augmented-diffs";

const sequenceNumber = process.argv[2];
const outputFileName = process.argv[3];
const url = `${OSC_SOURCE_URL}/${sequenceNumber}.osc`;

async function downloadFile(url, outputFileName) {
  const oscFile = fs.createWriteStream(outputFileName);
  try {
    const res = await axios({
      method: "get",
      url,
      responseType: "stream",
    });
    res.data.pipe(oscFile);
  } catch (err) {
    console.error(err);
  }
}

downloadFile(url, outputFileName).then(() => {
  console.log(`Downloaded ${url} to ${outputFileName}`);
});
