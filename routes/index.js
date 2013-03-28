// index
module.exports.index = function(req, res) {
  var db = req.app.settings.db;
  res.render('index', {
    title: 'Chat'
  });
};

module.exports.auth  = require('./auth');
