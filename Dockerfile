# Stage 1: Build the React app
FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

RUN chmod +x /app/node_modules/.bin/vite

# Copy the rest of the application source code
COPY . .

# Generate combined_redirects.json during the build process
RUN node generate_combined_redirects.js

RUN npm run build

# Stage 2: Create the production image
FROM node:18

WORKDIR /app

COPY package.json ./
COPY server.js ./
COPY utils ./utils/

RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/combined_redirects.json ./

EXPOSE 8080

CMD ["node", "server.js"]