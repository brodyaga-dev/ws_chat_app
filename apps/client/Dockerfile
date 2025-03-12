FROM node:20-alpine as builder

WORKDIR /app

# Copy root workspace files
COPY package*.json ./
COPY tsconfig*.json ./

# Copy shared package
COPY packages/shared/ ./packages/shared/

# Copy client package
COPY apps/client/package*.json ./apps/client/
COPY apps/client/tsconfig*.json ./apps/client/

# Install dependencies using workspace feature
RUN npm install

# Copy source code
COPY apps/client/src/ ./apps/client/src/
COPY apps/client/index.html ./apps/client/
COPY apps/client/vite.config.ts ./apps/client/

# Build shared package first
WORKDIR /app/packages/shared
RUN npm run build

# Build client
WORKDIR /app/apps/client
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/apps/client/dist /usr/share/nginx/html
COPY apps/client/nginx.conf /etc/nginx/nginx.conf

# Remove the default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 