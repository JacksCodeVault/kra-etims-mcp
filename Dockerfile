# ==========================================
# Multi-stage Dockerfile for KRA eTIMS MCP
# ==========================================

# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json tsconfig.json tsup.config.ts ./

# Install all dependencies
RUN npm ci

# Copy source code and documentation
COPY src/ ./src/
COPY kra-docs/ ./kra-docs/

# Build production bundle
RUN npm run build

# Stage 2: Production Runner
FROM node:22-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built distribution from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/kra-docs ./kra-docs
COPY README.md LICENSE ./

# Run as non-root node user for container security
USER node

# Expose HTTP/SSE port (used in HTTP mode)
EXPOSE 3000

# Healthcheck for container restart and orchestration
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 0

# Default entrypoint
ENTRYPOINT ["node", "dist/index.js"]

# Default CMD: STDIO mode (pass --http 3000 to switch to HTTP mode)
CMD []
