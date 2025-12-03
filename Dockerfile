FROM node:20-alpine

WORKDIR /app

# 
COPY package*.json ./

# install deps cleanly
RUN npm ci --only=production
RUN npm install pm2 -g

# copy all remaining files
COPY . .

EXPOSE 8080

CMD ["pm2-runtime", "Server.js", "--name", "moraserver"]