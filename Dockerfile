FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Create directory for database with proper permissions
RUN mkdir -p /app/data && chown -R node:node /app

# Switch to non-root user
USER node

# Expose port
EXPOSE 4001

# Start the application
CMD ["node", "server.js"]
