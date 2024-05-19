FROM node:latest
EXPOSE 8080
ENV REACT_APP_GRAPHQL_URL="https://backendsportunity2017.com/graphql"
ADD package.json /tmp/package.json
RUN rm -rf node_modules/
RUN npm install -g babel-cli webpack core-js @babel/core @babel/node
RUN cd /tmp && npm install
RUN mkdir -p /frontendsite && cp -a /tmp/node_modules /frontendsite
COPY . /frontendsite
WORKDIR /frontendsite
CMD npm run start