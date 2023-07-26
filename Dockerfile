FROM node:8
WORKDIR /app
COPY . /app
RUN npm install
CMD npm start
