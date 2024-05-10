#!/usr/bin/env node

const { program } = require('commander');
const axios = require('axios');
const zlib = require('zlib');
const sax = require('sax');
const changesetParser = require("real-changesets-parser");
const fs = require('fs');
const readline = require('readline');

const dataPath = process.env.DATA_PATH || 'data';

/**
 * Runs the process to retrieve and process changesets for a given date and hour.
 * @param {string} date - The date in the format 'YYYY-MM-DD'.
 * @param {number} hour - The hour of the day (0-23).
 * @returns {void}
 */
async function run(date, hour) {
    let url = getHourlyReplicationFileURL(date, hour);
    let changesets = await getChangesetIDs(url);
    // changesets = changesets.slice(0, 2);
    // console.log(changesets);
    processChangesets(changesets, date, hour);
}

/**
 * Generates the URL for the hourly replication file based on the given date and hour.
 * @param {string} date - The date in the format 'YYYY-MM-DD'.
 * @param {number} hour - The hour of the day (0-23).
 * @returns {string} The URL for the hourly replication file.
 */
function getHourlyReplicationFileURL(date, hour) {
    // Add a leading zero to the hour if it is a single digit
    hour = hour.toString().padStart(2, '0');
    let startDate = new Date(`${date}T${hour}:00:00Z`);
    console.log(`Processing an hour of data starting from ${startDate}`);
    // Calculate the sequence number for the hourly replication file from the date
    let timestamp = startDate.getTime() / 1000;
    let sequenceNumber = timestamp/(60*60) - 374287;
    console.log(`Processing hourly replication sequence number ${sequenceNumber}`);

    // Break the sequence number into 3 chunks
    let sequenceChunks = sequenceNumber.toString().padStart(9, '0').match(/(\d{3})(\d{3})(\d{3})/);
    let sequenceChunksFormatted = sequenceChunks.slice(1).join('/');

    let url = `https://planet.openstreetmap.org/replication/hour/${sequenceChunksFormatted}.osc.gz`;
    return url;
};

/**
 * Retrieves the unique changeset IDs from the hourly replication file.
 * @param {string} replicationFileURL - The URL of the hourly replication file.
 * @returns {Promise<string[]>} A promise that resolves to an array of unique changeset IDs.
 */
async function getChangesetIDs(replicationFileURL) {
    return new Promise((resolve, reject) => {
        // Process the XML file as a stream to avoid loading the entire file into memory
        // Create a SAX parser
        const parser = sax.createStream(true);

        // Extract unique changeset ids
        const changesets = new Set();

        // Handle the opening tag of an element
        parser.on('opentag', (node) => {
            if (node.name === 'node' || node.name === 'way' || node.name === 'relation') {
                const changeset = node.attributes.changeset;
                if (changeset) {
                    changesets.add(changeset);
                }
            }
        });

        // Handle the end of the XML document
        parser.on('end', () => {
            console.log(`Found ${changesets.size} unique changesets in the hourly replication file`);
            resolve(Array.from(changesets));
        });

        // Handle errors
        parser.on('error', (error) => {
            reject(error);
        });

        // Download the gz file and unzip it
        console.log(`Downloading and processing ${replicationFileURL}`);
        axios.get(replicationFileURL, { responseType: 'stream' })
            .then(response => {
                response.data
                    .pipe(zlib.createGunzip())
                    .pipe(parser);
            })
            .catch(error => {
                reject(error);
            });
    });
}

/**
 * Processes an array of changesets asynchronously.
 * @param {string[]} changesets - An array of changeset IDs.
 * @param {string} date - The date in the format 'YYYY-MM-DD'.
 * @param {number} hour - The hour of the day (0-23).
 * @returns {void}
 */
async function processChangesets(changesets, date, hour) {
    // Array to store the file paths of the processed changesets
    const results = [];

    // Process each changeset asynchronously
    await Promise.all(changesets.map(async (changeset) => {
        // Process the changeset and get the result
        const result = await processChangeset(changeset);
        results.push(result);
    }));

    // Combine the processed changesets into a single file
    combineResults(results, date, hour);
}

/**
 * Processes a single changeset and returns the file path of the processed changeset.
 * @param {string} changeset - The changeset ID.
 * @returns {Promise<string>} A promise that resolves to the file path of the processed changeset.
 */
async function processChangeset(changeset) {
    // Process the changeset asynchronously and return the result
    const url = `https://real-changesets.s3.amazonaws.com/${changeset}.json`;
    try {
        const response = await axios.get(url);
        const data = response.data;
        const geojson = changesetParser(data);
        const features = geojson.features;
        const filePath = `${dataPath}/${changeset}_features.json`;
        await fs.writeFile(filePath, '', (error) => {
            if (error) {
                console.error(`Error writing to file: ${error}`);
            }
        });
        features.forEach(async (feature) => {
            const featureString = JSON.stringify(feature);
            
            await fs.appendFile(filePath, `${featureString}\n`, (error) => {
                if (error) {
                    console.error(`Error writing feature to file: ${error}`);
                }
            });
        });
        return filePath;
    } catch (error) {
        console.error(`Error processing changeset ${changeset}: ${error}`);
    }
}

/**
 * Combines the results of processed changesets into a single file.
 * @param {string[]} results - An array of file paths of processed changesets.
 * @param {string} date - The date in the format 'YYYY-MM-DD'.
 * @param {number} hour - The hour of the day (0-23).
 * @returns {void}
 */
async function combineResults(results, date, hour) {
    console.log(`Combining results from ${results.length} changesets`);
    const outputStream = fs.createWriteStream(`${dataPath}/${date}T${hour}:00.geojson`);

    outputStream.write('{"type":"FeatureCollection","features":[');

    let divider = '';

    for (let i = 0; i < results.length; i++) {
        const filePath = results[i];
        const inputStream = fs.createReadStream(filePath);

        const rl = readline.createInterface({
            input: inputStream,
            output: process.stdout,
            terminal: false
        });

        rl.on('line', (line) => {
            outputStream.write(divider);
            divider = ',';
            outputStream.write(line);
        });

        await new Promise((resolve, reject) => {
            rl.on('close', () => {
                resolve();
            });

            rl.on('error', (error) => {
                reject(error);
            });
        });
    }

    outputStream.write(']}');
    outputStream.end();
}

program
    .command('process-hour <date> <hour>')
    .description('Process an hour of changesets starting from a given date and hour (in UTC) and combine the changed features into a single GeoJSON file.')
    .action(run);

program.parseAsync(process.argv);