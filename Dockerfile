FROM nikolaik/python-nodejs:latest

# set the working directory
WORKDIR /rqfo

# install requirements
COPY requirements.txt .
RUN pip install -r requirements.txt

# install node dependencies
COPY package.json package-lock.json ./
RUN npm install

# copy the rest of the content
COPY . .

# run the application
CMD ["npm", "start"]
