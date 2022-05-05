FROM node:14-stretch

RUN mkdir /app
WORKDIR /app

COPY package.json /app
COPY package-lock.json /app
RUN npm install

COPY . /app
CMD ["npm", "run", "start-ci"]
