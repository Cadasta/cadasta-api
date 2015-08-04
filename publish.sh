#!/bin/bash

rm -rf src
tar -zxf src.tar.gz
cd deploy
sudo npm install --production
grunt apidoc:docs

