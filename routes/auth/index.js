// login
module.exports.login = function(req, res) {
  oauth.getOAuthRequestToken(function(err, token, secret, results) {
    if (err) {
      console.log(err);
      res.send(err, 500);
    } else {
      req.session.oauth = {};
      req.session.oauth.token = token;
      req.session.oauth.token_secret = secret;
      console.log(req.session.oauth);
      console.log(results);
      res.redirect('https://api.twitter.com/oauth/authorize?oauth_token=' + token);
    }
  });
};

// callback
module.exports.callback = function(req, res) {
  req.session.oauth = {};
  req.session.oauth.token = req.query.oauth_token;
  req.session.oauth.verifier = req.query.oauth_verifier;
  var auth = req.session.oauth;
  oauth.getOAuthAccessToken(auth.token, null, auth.verifier,
    function(err, access_token, access_token_secret, results) {
      if (err) {
        console.log(err);
        res.send(err, 500);
      } else {
        req.session.user = results.screen_name;
        req.session.oauth.access_token = access_token;
        req.session.oauth.access_token_secret = access_token_secret;
        console.log(results);
        res.redirect('/');
      }
    });
};

// logout
module.exports.logout = function(req, res) {
};

var OAuth = require('oauth').OAuth
  , oauth = new OAuth(
    'https://api.twitter.com/oauth/request_token',
    'https://api.twitter.com/oauth/access_token',
    (process.env.TWITTER_CONSUMER_KEY || 'CONSUMER_KEY'),
    (process.env.TWITTER_CONSUMER_SECRET || 'CONSUMER_SECRET'),
    '1.0A',
    'http://127.0.0.1:' + process.env.PORT + '/auth/twitter/callback',
    'HMAC-SHA1'
  );
