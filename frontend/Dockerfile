FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm install --workspaces

# Copy source code
COPY frontend ./frontend/
COPY shared ./shared/

WORKDIR /app/frontend

# Build Next.js
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
