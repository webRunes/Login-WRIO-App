FROM ubuntu:15.04
MAINTAINER denso.ffff@gmail.com

RUN apt-get update && apt-get install -y nodejs npm mc build-essential g++ git

RUN ln -s /usr/bin/nodejs /usr/bin/node
RUN npm install -g browserify gulp nodemon babel gulp
RUN mkdir -p /srv/www


# Login

COPY package.json /srv/package.json
RUN cd /srv/ && npm install # packages are installed globally to not modify titter directory
COPY . /srv/www/


EXPOSE 5000
CMD cd /srv/www/ && rm -fr node_modules && \
    gulp nodemon
