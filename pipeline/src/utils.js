const axios = require('axios');
const zlib = require('zlib');
const sax = require('sax');

/**
 * Generates the URL for the hourly replication file based on the given date and hour.
 * @param {string} date - The date in the format 'YYYY-MM-DD'.
 * @param {number} hour - The hour of the day (0-23).
 * @returns {string} The URL for the hourly replication file.
 */
function getHourlyReplicationFileURL(date, hour) {
    // Add a leading zero to the hour if it is a single digit
    hour = hour.toString().padStart(2, '0');
    console.log(`Got date: ${date} and hour: ${hour}`)
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
 * Checks if the given coordinates are valid.
 * @param {number|number[]} coordinates - The coordinates to check.
 * @returns {boolean} true if the coordinates are invalid, false otherwise.
 */
function containsInvalidCoordinate(coordinates) {
    if (coordinates === null || coordinates === undefined || coordinates === Infinity || coordinates === -Infinity) {
        return true;
    } else if (Array.isArray(coordinates)) {
        return coordinates.some(containsInvalidCoordinate);
    } else {
        return false;
    }
}

module.exports = { getHourlyReplicationFileURL, getChangesetIDs, containsInvalidCoordinate };
