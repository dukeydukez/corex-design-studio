FROM node:20-alpine

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm install --workspaces

# Copy source code
COPY backend ./backend/
COPY shared ./shared/

WORKDIR /app/backend

# Build
RUN npm run build

EXPOSE 3001

CMD ["node", "dist/index.js"]
