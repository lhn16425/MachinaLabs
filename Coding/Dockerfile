# Use a specific Node.js base image (e.g., node:20-alpine for a lightweight image)
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
# This allows Docker to cache the npm install step if dependencies don't change
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the application source code to the working directory
COPY . .

# Expose the port your Node.js application listens on
EXPOSE 3000

# Define the command to run your application when the container starts
CMD ["node", "server.js"]