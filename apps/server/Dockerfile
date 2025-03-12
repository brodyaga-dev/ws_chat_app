FROM node:20-alpine

WORKDIR /app

# Copy root workspace files
COPY package*.json ./
COPY tsconfig*.json ./

# Copy shared package
COPY packages/shared/ ./packages/shared/

# Copy server package
COPY apps/server/package*.json ./apps/server/
COPY apps/server/tsconfig*.json ./apps/server/

# Install dependencies using workspace feature
RUN npm install

# Copy source code
COPY apps/server/src/ ./apps/server/src/

# Build shared package first
WORKDIR /app/packages/shared
RUN npm run build

# Build server
WORKDIR /app/apps/server
RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start"] 