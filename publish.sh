#!/bin/bash

rm -rf src
tar -zxf app.tar.gz
cd deploy
sudo npm install --production
grunt apidoc:docs

