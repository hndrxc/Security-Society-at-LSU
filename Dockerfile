FROM node:22-slim
RUN apt-get update && apt-get install -y curl git python3 make g++
WORKDIR /app
COPY package*.json ./
RUN npm install
CMD ["npm", "run", "dev"]


