# Step 1: Build Stage
FROM node:20-alpine as builder

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json (or yarn.lock) files
COPY package*.json ./
# If you're using yarn with a yarn.lock file, copy it instead of package-lock.json and use yarn commands
# COPY package.json yarn.lock ./

# Install dependencies
RUN npm install
# For yarn, use the following command
# RUN yarn install

# Copy the rest of your app's source code from your host to your image filesystem.
COPY . .

# COPY .env .env

# Print the contents of the .env file for debugging purposes
# RUN echo "Contents of .env file:" && cat .env

# Build the application for production
RUN npm run build
# For yarn, use the following command
# RUN yarn build

# Step 2: Run Stage
FROM node:20-alpine

WORKDIR /app

# Copy the built next app from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
# For yarn, use the following command
# CMD ["yarn", "start"]