# # Build Docker image
# docker build -t frontend-app .

# Stage 1: Build the React app
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the source code
COPY . .

# The address of the API, when given at build time (--build-arg API_BASE=http://localhost:8000); without it the
# build uses src/config/config.js as it is, which run_frontend_backend writes
ARG API_BASE
RUN if [ -n "$API_BASE" ]; then echo "export const API_BASE = \"$API_BASE\";" > src/config/config.js; fi

# Build the production-ready app
RUN npm run build

# Stage 2: Serve the app using Nginx
FROM nginx:alpine

# Copy build output to Nginx's public directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config to handle SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
