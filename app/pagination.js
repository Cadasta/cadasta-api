var pagination = {}

/**
 * Adds pagination related headers to the response.
 *
 * @param req   the request
 * @param res   the response
 * @param count the total result count
 */
pagination.addPaginationHeaders = function(req, res, count){

    var limit = req.query.limit;
    var offset = req.query.offset;
    var project_id = req.params.id;
    var start_idx = 0;
    var end_idx = 0;

    if (limit && offset){
        limit = parseInt(limit);
        offset = parseInt(offset);
        start_idx = offset + 1;
        end_idx = limit + offset;
        var count = parseInt(count);
        end_idx = end_idx < count ? end_idx : count;
        res.set('Content-Range', start_idx + '-' + end_idx + '/' + count);
        //console.log(res);
    }
}

module.exports = pagination;
