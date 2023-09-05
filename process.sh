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
echo '{ "type": "FeatureCollection", "features": [' > /tmp/final_geojson.json

echo 'Parsing files'
for (( i=start_num; i>end_num; i-- )); do
    echo $i
    file_path="/tmp/${i}.osc"
    node parser.js $file_path | jq '.features[]' >> /tmp/final_geojson.json
    # Add a comma between geojsons except for the last one
    if [[ "$i" -ne "$((end_num+1))" ]]; then
        echo ',' >> /tmp/final_geojson.json
    fi
done
echo 'Done parsing files'

echo '] }' >> /tmp/final_geojson.json
