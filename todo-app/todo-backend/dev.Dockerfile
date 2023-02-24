FROM node:16.17.0
  
WORKDIR /usr/src/app

COPY --chown=node:node . .

RUN npm install
  
USER node

CMD npm run dev