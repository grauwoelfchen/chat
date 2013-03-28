// login
module.exports.login = function(req, res) {
  oauth.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results) {
    if (error) {
      console.log(error);
      res.send(error, 500);
    } else {
      req.session.oauth = {
        oauth_token: oauth_token,
        oauth_token_secret: oauth_token_secret,
        request_token_results: results
      };
      console.log(req.session.oauth);
      res.redirect('https://api.twitter.com/oauth/authorize?oauth_token=' + oauth_token);
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
    process.env.TWITTER_CONSUMER_KEY || 'CONSUMER_KEY',
    process.env.TWITTER_CONSUMER_SECRET || 'CONSUMER_SECRET',
    '1.0A',
    '{SITE URL}/auth',
    'HMAC-SHA1'
  );
