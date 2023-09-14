# Start with an official Node image
FROM node:18

# Update the system and install necessary dependencies
RUN apt-get update && \
  apt-get install -y parallel jq && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

# Create an app directory to hold the application code inside the image
WORKDIR /usr/src/app

# Copy your package.json and package-lock.json (if you have one) into the container
COPY package*.json ./

# Install your Node dependencies
RUN npm install

# Copy your Node scripts into the container
COPY fetchOsc.js ./
COPY parser.js ./

# The main script to run the tasks
COPY process.sh ./

# Install geojson-merge
RUN npm install -g geojson-merge

# Give execute permissions to the script
RUN chmod +x process.sh

# The command to run when the container starts
ENTRYPOINT [ "./process.sh" ]
