const http = require('http');
const fs = require('fs');
const processFile = require('./parser')
const { exec } = require('node:child_process');

const START_SEQUENCE = 5668181;
const OSC_SOURCE_URL = 'http://s3-eu-west-1.amazonaws.com/overpass-db-eu-west-1/augmented-diffs';
const DOWNLOAD_PATH = '/tmp';

const maxRetries = 10;
const retryInterval = 5000; // 5 seconds

const downloadFile = (index, retryCount = 0) => {
  const url = `${OSC_SOURCE_URL}/${index}.osc`;
  const outputPath = `${DOWNLOAD_PATH}/${index}.osc`;

  http.get(url, (response) => {
    if (response.statusCode === 200) {
      const fileStream = fs.createWriteStream(outputPath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`✔ Downloaded ${outputPath}`);

        // parse
        processFile(outputPath, (err, geojson) => {
            const geojsonPath = `${DOWNLOAD_PATH}/${index}.geojson`;
            fs.writeFileSync(`${DOWNLOAD_PATH}/${index}.geojson`, JSON.stringify(geojson, null, 2));

            // convert to fgb
            convertToFlatGeobuf(geojsonPath, `${DOWNLOAD_PATH}/${index}.fgb`, (err) => {
                if (err) {
                    console.log('Failed to create FGB', err);
                }
            })
        });

        // download next file
        downloadFile(index + 1, 0);
      });
    } else if (retryCount < maxRetries) {
      console.error(`${index}...${response.statusCode}`);

      setTimeout(() => {
        downloadFile(index, retryCount + 1);
      }, retryInterval);
    } else {
      console.error(`Max retries exceeded. File could not be downloaded: ${index}`);
    }
  }).on('error', (error) => {
    console.error('Failed to download file:', error);
  });
};

if (START_SEQUENCE) {
    console.log('Starting download...')
    downloadFile(START_SEQUENCE);
}

const convertToFlatGeobuf = (inputGeoJSON, outputFlatGeobuf, callback) => {
    const ogr2ogrCommand = `ogr2ogr -f "FlatGeobuf" ${outputFlatGeobuf} ${inputGeoJSON} -skipfailures`;
    console.log('Converting to FGB', ogr2ogrCommand);

    exec(ogr2ogrCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error converting to FlatGeobuf: ${stderr}`);
            callback(error);
        } else {
            console.log(`Successfully converted to FlatGeobuf: ${outputFlatGeobuf}`);
            callback(null);
        }
    });
};