#!/bin/bash

rm -rf deploy
tar -zxf deploy.tar.gz
cd deploy
sudo npm install --production
grunt apidoc:docs

