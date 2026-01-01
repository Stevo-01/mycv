# Base image
FROM node:20-alpine

WORKDIR /mycv

# Copy package files
COPY package*.json ./

RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose the application port
EXPOSE 3000

# Set environment variable
ENV NODE_ENV=development

# Start the application
CMD ["npm", "run", "start:dev"]



## Base image
#FROM node:20-alpine AS base
#
## Development stage
#FROM base AS development
#WORKDIR /app
#
## Copy package files
#COPY package*.json ./
#

## Install all dependencies (including dev dependencies)
#RUN npm ci
#
## Copy source code
#COPY .. .
#
## Build the application
#RUN npm run build
#
## Production stage
#FROM base AS production
#WORKDIR /app
#
## Copy package files
#COPY package*.json ./
#
## Install only production dependencies
#RUN npm ci --only=production && npm cache clean --force
#
## Copy built application from development stage
#COPY --from=development /app/dist ./dist
#
## Create directory for SQLite database
#RUN mkdir -p /app/data
#
## Expose the application port
#EXPOSE 3000
#
## Set environment variable
#ENV NODE_ENV=production
#
## Start the application
#CMD ["node", "dist/main"]
