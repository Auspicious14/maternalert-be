# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Copy source and build
COPY . .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# The official node:alpine image already has a 'node' user with UID 1000
# which is what Hugging Face requires. We'll use that instead of creating a new one.
USER node

# Copy built assets and production dependencies
# Ensure we set ownership to the node user
COPY --from=builder --chown=node:node /app/package*.json ./
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/prisma ./prisma
COPY --from=builder --chown=node:node /app/prisma.config.ts ./prisma.config.ts

# Set production environment
ENV NODE_ENV=production
ENV PORT=7860

# Expose the port (Hugging Face default is 7860)
EXPOSE 7860

# Run the app
CMD ["npm", "run", "start:prod"]
