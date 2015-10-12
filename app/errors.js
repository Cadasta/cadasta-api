var errors = {};

errors.OptionError = function(message) {
    this.name = 'URL option error';
    this.status = 400;
    this.message = message || 'Error.';
    this.stack = (new Error()).stack;
};

errors.ParameterError = function(message) {
    this.name = 'Missing parameter';
    this.status = 400;
    this.message = message || 'Error.';
    this.stack = (new Error()).stack;
};
module.exports = errors;