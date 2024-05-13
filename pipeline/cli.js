#!/usr/bin/env node

const { program } = require('commander');

const { getHourlyReplicationFileURL, getChangesetIDs } = require('./src/utils');
const { processChangesets, processChangeset } = require('./src/process');

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

async function processSingleChangeset(changeset) {
    await processChangeset(changeset);
}

program
    .command('process-hour <date> <hour>')
    .description('Process an hour of changesets starting from a given date and hour (in UTC) and combine the changed features into a single GeoJSON file.')
    .action(run);

program
    .command('process-changeset <changeset>')
    .description('Process a single changeset and save the features to a JSON file - for debugging purposes.')
    .action(processSingleChangeset);

program.parseAsync(process.argv);