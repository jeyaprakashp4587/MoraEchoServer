FROM node:20-alpine

WORKDIR /app

 
COPY package*.json ./


RUN npm ci --only=production
RUN npm install pm2 -g

COPY . .

EXPOSE 8080

CMD ["pm2-runtime", "Server.js", "--name", "moraserver"]