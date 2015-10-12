#!/bin/bash

rm -rf app
rm -rf node_modules
tar -zxf app.tar.gz
cd app
sudo npm install --production

