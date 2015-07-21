var winston = require('winston');
var util = require('util')

function formatArgs(args){
    return [util.format.apply(util.format, Array.prototype.slice.call(args))];
}

console.log = function(){
    winston.info.apply(winston, formatArgs(arguments));
};
console.info = function(){
    winston.info.apply(winston, formatArgs(arguments));
};
console.warn = function(){
    winston.warn.apply(winston, formatArgs(arguments));
};
console.error = function(){
    winston.error.apply(winston, formatArgs(arguments));
};
console.debug = function(){
    winston.debug.apply(winston, formatArgs(arguments));
};