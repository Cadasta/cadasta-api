#!/bin/bash

rm -rf app
rm -rf node_modules
tar -zxf app.tar.gz
pip install -r requirements.txt
cd app
sudo npm install --production
