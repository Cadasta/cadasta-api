var express = require('express');
var router = express.Router();
var multer = require('multer');
var common = require('../common.js');
var upload = multer();
var settings = require('../settings/settings.js');
var ctrlCommon = require('../controllers/common.js');
var Q = require('q');
var pgb = require('../pg-binding.js');
var DataTransformer = require('cadasta-data-transformer');
var ingestion_engine = DataTransformer(settings);
var jsonfile = require('jsonfile');
var multiparty = require('multiparty');
var PythonShell = require('python-shell');




module.exports = router;