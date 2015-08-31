var errors = require('./errors.js')

var dictionary = {};

dictionary._validate = function(tablename, columns){

    if(typeof columns === "string") {
        columns = columns.split(',');
    }

    if(!columns instanceof Array) {
        throw new Error("Invalid 'columns' argument");
    }

    if(!dictionary.hasOwnProperty(tablename)){
        throw new Error('"' + tablename + " not yet defined in lookup.")
    }

    columns.every(function(col){

        var flag = dictionary[tablename].indexOf(col)
        if(flag === -1){
            throw new errors.OptionError('Bad request: invalid column option.');
            return false;
        }
        return true;
    });

    return true;
};
module.exports = dictionary;