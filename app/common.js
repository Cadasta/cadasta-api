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

