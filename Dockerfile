FROM nikolaik/python-nodejs:latest

# set the working directory
WORKDIR /rqfo

# install node dependencies
COPY package.json ./
RUN npm install

# copy the rest of the content
COPY . .

# run the application
CMD ["npm", "start"]
