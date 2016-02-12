#!/bin/sh

cd /srv/www/storage_wrio_app/current/
node runexpire.js >> /tmp/expire.log
