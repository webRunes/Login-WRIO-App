FROM webrunes/wriobase:latest
MAINTAINER denso.ffff@gmail.com

# quick fix for docker and npm3 compatibility

RUN cd $(npm root -g)/npm \
 && npm install fs-extra \
 && sed -i -e s/graceful-fs/fs-extra/ -e s/fs\.rename/fs.move/ ./lib/utils/rename.js

# Login

COPY package.json /srv/package.json
RUN cd /srv/ && npm install # packages are installed globally to not modify titter directory

WORKDIR /srv/www
COPY . /srv/www/
RUN gulp


EXPOSE 5000
CMD cd /srv/www/ && rm -fr node_modules && \
    gulp watch
