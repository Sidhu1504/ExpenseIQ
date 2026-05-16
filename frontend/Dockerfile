FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

# Run Next.js in development mode with hot-reloading
CMD ["npm", "run", "dev"]
