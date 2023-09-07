#!/bin/bash

# Check if the necessary arguments were provided
if [[ -z "$1" ]] || [[ -z "$2" ]]; then
    echo "Usage: $0 <start_number> <num_files>"
    exit 1
fi

# Starting number provided as the first argument
start_num=$1

# Number of files to fetch
num_files=$2

# Calculate the end number
end_num=$((start_num - num_files))

# Fetch .osc files using fetchOsc.js
fetchOscFunction() {
    sequence_num=$1
    file_path="/tmp/${sequence_num}.osc"
    node fetchOsc.js $sequence_num $file_path
}

export -f fetchOscFunction

seq $end_num $start_num | parallel fetchOscFunction

# Parse .osc files and collect into a single geojson using parser.js and jq
echo 'Parsing files'
for (( i=start_num; i>end_num; i-- )); do
    echo $i
    file_path="/tmp/${i}.osc"
    node parser.js $file_path >> "/tmp/${i}.geojson"
done
echo 'Done parsing files'

echo 'Combining files'
geojson-merge /tmp/*.geojson > /tmp/final_geojson.json
echo 'Done combining files'

echo 'Replace nulls with 0'
sed -i 's/null/0/g' /tmp/final_geojson.json
echo 'Done replacing nulls with 0'
