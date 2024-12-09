# Use the Node.js LTS image as the base
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port for MQTT (if applicable)
EXPOSE 1883

# Default command to run the MQTT server
CMD ["npm", "run", "mqtt"]
