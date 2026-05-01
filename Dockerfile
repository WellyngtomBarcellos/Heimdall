FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Serve stage using NGINX
FROM nginx:alpine

# Configure NGINX to listen on port 8009 and support SPA routing
RUN echo "server { \
    listen 8009; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files \$uri \$uri/ /index.html; \
    } \
}" > /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 8009
EXPOSE 8009

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]
