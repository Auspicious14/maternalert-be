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

# Create a non-root user for security (Hugging Face requirement)
RUN adduser -D -u 1000 appuser
USER appuser

# Copy built assets and production dependencies
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Set production environment
ENV NODE_ENV=production
ENV PORT=7860

# Expose the port (Hugging Face default is 7860)
EXPOSE 7860

# Run the app
CMD ["npm", "run", "start:prod"]
