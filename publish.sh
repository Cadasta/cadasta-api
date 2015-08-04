#!/bin/bash

rm -rf src
tar -zxf app.tar.gz
cd app
sudo npm install --production
grunt apidoc:docs

