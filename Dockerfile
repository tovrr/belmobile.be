# Stage 1: Build the React app
FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN chmod +x /app/node_modules/.bin/vite

COPY . .

RUN npm run build

# Stage 2: Create the production image
FROM node:18

WORKDIR /app

COPY package.json ./
COPY server.js ./

RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["node", "server.js"]
