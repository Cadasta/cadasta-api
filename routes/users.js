var express = require('express');
var router = express.Router();

/**
 * @api {get} /user/:id Request User information
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiParam {Number} id User's unique ID.
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.get('/user/:id', function(req, res, next) {
  res.send('respond with a user');
});

module.exports = router;
