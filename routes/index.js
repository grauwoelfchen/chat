// index
module.exports.index = function(req, res) {
  var db = req.app.settings.db;
  var user = req.session.user || ''
  res.render('index', {
    title: 'Chat', user: user
  });
};

module.exports.auth  = require('./auth');
