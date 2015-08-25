var common = module.exports = {};

common.getArguments = function (req) {
    var args;

    //Grab POST or QueryString args depending on type
    if (req.method.toLowerCase() == "post") {
        //If a post, then arguments will be members of the this.req.body property
        args = req.body;
    } else if (req.method.toLowerCase() == "get") {
        //If request is a get, then args will be members of the this.req.query property
        args = req.query;
    }
    return args;
};

common.isInteger = function(x){
    return Math.round(x) === x;
};

common.parseQueryOptions = function(queryParams, nonGeomColumns, geomCol ) {

    var queryOptions = {
        columns: nonGeomColumns,
        geometryColumn: geomCol,
        order_by: '',
        limit: '',
        where: ''
    };

    var colArr = nonGeomColumns.split(',');

    if(queryParams.hasOwnProperty('returnGeom')) {

        if(['true', 'false'].indexOf(queryParams.returnGeom) === -1) {
            throw Error("Bad Request; invalid 'returnGeom' option");
        }

        if(queryParams.returnGeom === 'false') {
            queryOptions.geometryColumn = null;
        }
    }

    if(queryParams.hasOwnProperty('fields')) {

        var selectedFieldsArr = queryParams.fields.split(',');

        selectedFieldsArr.every(function(field){

            if(colArr.indexOf(field) === -1) {

                throw Error("Bad Request; invalid 'fields' option");
            }

        });

        queryOptions.columns = queryParams.fields;
    }

    if(queryParams.hasOwnProperty('limit')) {

        if(!common.isInteger(Number(queryParams.limit))) {

            throw Error("Bad Request; invalid 'limit' option");
        }

        queryOptions.limit = "LIMIT " + queryParams.limit;
    }

    if(queryParams.hasOwnProperty('order_by')) {

        var orderByArr = queryParams.order_by.split(',');

        orderByArr.every(function(field){

            if(colArr.indexOf(field) === -1) {
                throw Error("Bad Request; invalid 'order_by' option");
            }

        });

        queryOptions.order_by = 'ORDER BY ' + queryParams.order_by;
    }


    if(queryParams.hasOwnProperty('order')) {

        var orders = ['ASC', 'DESC'];

        if(orders.indexOf(queryParams.order) === -1) {
            throw Error("Bad Request; invalid 'order' option");
        }

        if(queryOptions.order_by) {
            queryOptions.order_by + ' ' + queryParams.order;
        }
    }


    return queryOptions;

}