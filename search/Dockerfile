FROM node:16-alpine
RUN apk update && apk add --no-cache curl lsof
WORKDIR /app/
COPY package*.json ./
RUN npm install --production
COPY . ./
USER node
EXPOSE 80
CMD ["node", "app.js"]
