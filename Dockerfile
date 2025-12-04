# Build stage for backend
FROM node:18-alpine as backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production

# Build stage for frontend
FROM node:18-alpine as frontend-build
WORKDIR /app/frontend-build
RUN npm install -g http-server
COPY frontend ./
# Frontend is static files, no build needed

# Final stage - combine both
FROM node:18-alpine
WORKDIR /app

# Copy backend from build stage
COPY --from=backend-build /app/backend /app/backend

# Copy frontend files
COPY frontend /app/frontend

# Install http-server globally for serving frontend
RUN npm install -g http-server

# Expose ports
EXPOSE 3000 8080

# Set working directory to backend for running server
WORKDIR /app/backend

# Start both backend and frontend using concurrently
RUN npm install concurrently --save-prod

CMD ["npx", "concurrently", "node server.js", "http-server ../frontend -p 8080 -c-1"]
