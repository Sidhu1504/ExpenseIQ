FROM node:22-alpine 

# Install common native compilation packages
RUN apk add --no-cache python3 make g++ gcc

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

# Force Tesseract to compile/cache languages safely inside the working folder
ENV TESSDATA_PREFIX=/usr/src/app

EXPOSE 3000

CMD ["npx", "nodemon", "server.js"]
