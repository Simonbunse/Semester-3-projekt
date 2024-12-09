FROM node:18

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 1883

# Default command to run the MQTT server
CMD ["npm", "run", "mqtt"]
