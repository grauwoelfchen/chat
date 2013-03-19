
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.sample1 = function(req, res){
  var id = req.param('id');
  res.render('foo', {
    title: 'Sample',
    var1:  'Dog',
    var2:  'Cat',
    var3:  req.param('id')
  });
};

// db
var mongo = require('mongodb');
var client = new mongo.Db(
    'chat',
    new mongo.Server('127.0.0.1', 27017),
    {safe:true}
  );
client.open(function(err, client) {
  if (err) {
    console.log(err);
  } else {
    console.log('connected to mongodb');
  }
});

// list
exports.showMongo = function(req, res) {
  client.collection(
    'talks',
    function(err, collection) {
      if (err) {
        throw err;
      }
      collection.find().toArray(
        function(err, results) {
          if (err) {
            throw err;
          }
          res.render('mongo', {
            title: ':Mongo',
            list:  results
          });
        }
      );
    }
  );
};

// save
exports.saveMongo = function(req, res) {
  var name = req.param('name');
  client.collection(
    'talks',
    function(err, collection) {
      if (err) {
        throw err;
      }
      collection.save(
        {name:name},
        function(err) {
          if (err) {
            throw err;
          }
          res.redirect('/mongo');
        }
      );
    }
  );
};
