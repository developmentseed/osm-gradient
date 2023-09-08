#!/bin/bash

# Check if the necessary arguments were provided
if [[ -z "$1" ]] || [[ -z "$2" ]]; then
    echo "Usage: $0 <date> <hour> [num_files]"
    exit 1
fi

# Starting number provided as the first argument
start_date=$1

start_hour=$2

# Add a leading zero if the hour is less than 10
[[ $start_hour -lt 10 && $start_hour -ge 0 ]] && start_hour="0$start_hour"

# Number of files to fetch
num_files=${3:-60}
if (( num_files < 1 )); then
    num_files=1
fi
if (( num_files > 60 )); then
    num_files=60
fi

echo "Number of files to fetch: ${num_files}"

start_num=$(( $(date -d "${start_date}T${start_hour}:00:00Z" +%s)/60 - 22457216))

end_num=$((start_num + num_files - 1))

if [[ $start_num != $end_num ]]; then
    echo "Fetching files from number ${start_num} to ${end_num}"
else
    echo "Fetching file number ${start_num}"
fi

# Fetch .osc files using fetchOsc.js
fetchOscFunction() {
    sequence_num=$1
    file_path="/tmp/${sequence_num}.osc"
    node fetchOsc.js $sequence_num $file_path
}

export -f fetchOscFunction

seq $start_num $end_num | parallel fetchOscFunction

# Parse .osc files and collect into a single geojson using parser.js and jq
echo 'Parsing files'
for (( i=start_num; i<end_num; i++ )); do
    echo $i
    file_path="/tmp/${i}.osc"
    node parser.js $file_path > "/tmp/${start_date}-${start_hour}-${i}.geojson"
done
echo 'Done parsing files'

echo "Combining files"
output_file="/tmp/${start_date}T${start_hour}:00.geojsonld"
cat "/tmp/${start_date}-${start_hour}-*.geojson" > $output_file
echo "Done combining files"

echo 'Replace nulls with 0'
sed -i 's/null/0/g' $output_file
echo 'Done replacing nulls with 0'
