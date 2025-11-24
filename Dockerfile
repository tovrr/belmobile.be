# Stage 1: Build the React app
FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

RUN chmod +x /app/node_modules/.bin/vite

# Copy only necessary files for redirect generation
RUN mkdir -p utils
COPY generate_combined_redirects.js pages.csv ./
COPY utils/legacyUrlMap.ts utils/
COPY constants.ts ./ 

# Generate combined_redirects.json during the build process
RUN node generate_combined_redirects.js

# Copy the rest of the application source code
COPY . .

RUN npm run build

# Stage 2: Create the production image
FROM node:18

WORKDIR /app

COPY package.json ./
COPY server.js ./
COPY --from=builder /app/combined_redirects.json combined_redirects.json # Copy the generated redirects file from the builder stage

RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["node", "server.js"]