# Multi-stage production build for Instagram Ingestion Service
FROM node:24-alpine AS base

WORKDIR /app

# Install dependencies first (layer caching)
COPY package*.json ./
RUN npm install --omit=dev

# Copy application source code
COPY server ./server
COPY src/data ./src/data

# Run as non-root user for security
USER node

EXPOSE 4000

ENV NODE_ENV=production
ENV PORT=4000

CMD ["node", "server/server.js"]
