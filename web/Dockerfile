# =============================================================================
# Kintsugi Web Frontend Multi-Stage Dockerfile (React + Vite + Nginx)
# =============================================================================

# --- Stage 1: Build Web Assets ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files and install packages
COPY package.json package-lock.json ./
RUN npm ci

# Copy application source code and build production bundle
COPY . .

# Invalidate build cache for fresh builds
ARG BUILD_NUMBER=1
ENV BUILD_NUMBER=${BUILD_NUMBER}

RUN npm run build

# --- Stage 2: Production Nginx Server ---
FROM nginx:1.25-alpine AS production

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q -O - http://127.0.0.1/ > /dev/null || exit 1

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
