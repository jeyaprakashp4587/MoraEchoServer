FROM node:20-alpine

WORKDIR /app

# copy package files first
COPY package*.json ./
RUN npm install --production
RUN npm install pm2 -g
# copy the rest
COPY . .

# expose your actual server port
EXPOSE 8080

# start your server
CMD ["pm2-runtime", "Server.js", "--name", "moraserver", "--watch"]


