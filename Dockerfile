FROM node:11-alpine

RUN mkdir /app
WORKDIR /app
COPY . .
RUN npm install
CMD ["npm", "start"]
EXPOSE 7777
