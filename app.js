var dt = require('node-datetime');
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
    console.log("page data? ", aPageData)
    res.render('pages/index', aPageData);
});

app.get('/catalog', function(req, res){
    aPageData.nav = 'catalog';
    
    db.collection('stars').find().limit(10).sort({created: -1}).toArray(function(err, res2){
        if (err) return console.log(err);
        
        console.log(res2)
        aPageData.data = res2;
        res.render('pages/catalog', aPageData)
    })
});

app.post('/submit_star', function(req, res) {
    aPageData.nav = 'index';
    if (db){
        var data = req.body;
        db.collection('stars').count({name: data.name})
        .then (function(bExists){
            if (bExists){
                aPageData.star_added = 'This name is already in the Catalog, try another';
            }
            else {
                aPageData.star_added = 'Adding a star...';
            }
            return getNextSequence('stars')
        })
        .then(function(found){
            data.created = dt.create().format('Y-m-d H:M:S');
            data.id = found.value.seq;

            db.collection('stars').save(data);
            res.render('pages/index', aPageData);
            delete aPageData.star_added;
        })
        .catch(function(err){
            console.log('Got some error here: ', err)
        })
    }
});

app.use(express.static('public'));

app.listen(app.get('port'), function() {
    console.log('Node app is running on port ', app.get('port'));
});


function getNextSequence(name) {
    var ret = db.collection('counters').findAndModify({_id: name}, {}, {$inc: {seq: 1}}, {
        new: true,
        upsert: true
    });
    return ret;
}