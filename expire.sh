#!/bin/sh

cd /srv/www/login/current/
node runexpire.js >> /tmp/expire.log
