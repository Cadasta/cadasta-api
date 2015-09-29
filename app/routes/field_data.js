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



router.post('/:project_id/upload', function (req, res, next) {

    var form = new multiparty.Form();
    var parsedFile;
    var project_id = req.params.project_id;

    form.parse(req, function(err, fields, files) {

        var file = files.filedata;

        //Next, check for a dataset.  We need a dataset to load.
        if (!file || !file[0]) {
            res.status(200).json({status: "Load command must include a 'file_upload' parameter with a dataset to be loaded."});
            return;
        }

        jsonfile.readFile(file[0].path, function (err, obj) {

            obj.project_id = project_id;

            ingestion_engine.formProcessor.load(obj)
                .then(function(res){
                    console.log('New Survey: ' + res);
                });

            //Exit if errors
            if (err) {
                callback(err, {});
                return;
            }
        });

        //resp.end(util.inspect({fields:fields, files:files}));
        //parsedFile = parseCsv(files.upload[0].path);
        //console.log(parsedFile);
    });

});

/**
 * Get org id, title and project title
 * @param p_id
 * @returns {*|promise}
 */
function getOrg(p_id) {
    var deferred = Q.defer();

    var sql = 'SELECT o.id,o.title,p.title as project_title FROM organization o, project p WHERE o.id = (SELECT organization_id FROM project where id = ' + p_id + ') and p.organization_id = o.id and p.id = ' + p_id;

    pgb.queryCallback(sql, function (err, res) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(res);
        }
    });

    return deferred.promise;
}



module.exports = router;