var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var aPageData = {
    nav: ''
};

var db;
var MongoClient = require('mongodb').MongoClient
MongoClient.connect('mongodb://test:test@ds013926.mlab.com:13926/solar-systems', function(err, database){
  // ... start the server
  console.log('Db connected!')
  db = database;
})

app.use(bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
//app.use(express.json());       // to support JSON-encoded bodies
//app.use(express.urlencoded()); // to support URL-encoded bodies

app.set('port', (process.env.PORT || 5000));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
    aPageData.nav = 'index';
    res.render('pages/index');
});

app.get('/catalog', function(req, res){
    aPageData.nav = 'catalog';
    
    db.collection('stars').find().toArray(function(err, res2){
        if (err) return console.log(err);
        
        aPageData.data = res2;
        res.render('pages/catalog', aPageData)
    })
});

app.post('/submit_star', function(req, res) {
    aPageData.nav = 'index';
    if (db){
        db.collection('stars').save(req.body);
    }
    aPageData.star_added = true;
    res.render('pages/index', aPageData);
});

app.use(express.static('public'));

app.listen(app.get('port'), function() {
    console.log('Node app is running on port ', app.get('port'));
});
