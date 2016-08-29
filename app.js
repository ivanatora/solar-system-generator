var dt = require('node-datetime');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var aPageData = {
    nav: ''
};

var db;
var MongoClient = require('mongodb').MongoClient
MongoClient.connect('mongodb://test:test@ds013926.mlab.com:13926/solar-systems', function (err, database) {
    console.log('Db connected!')
    db = database;
})
var ObjectId = require('mongodb').ObjectID;

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({// to support URL-encoded bodies
    extended: true
}));
//app.use(express.json());       // to support JSON-encoded bodies
//app.use(express.urlencoded()); // to support URL-encoded bodies

app.set('port', (process.env.PORT || 5000));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
    aPageData.nav = 'index';
    res.render('pages/index', aPageData);
});

app.get('/static', function(req, res){
    res.send('static works!');
})

app.get('/catalog', function (req, res) {
    var iPage = 1;
    var iPageSize = 10;
    if (typeof req.query.page != 'undefined'){
        iPage = parseInt(req.query.page);
    }
    
    aPageData.nav = 'catalog';

    db.collection('stars').find().limit(iPageSize).skip((iPage-1) * iPageSize).sort({created: -1}).toArray()
    .then(function (res2) {
        aPageData.data = res2;
        return db.collection('stars').count()
    })
    .then(function(iCount){
        aPageData.total = iCount;
        aPageData.current_page = iPage;
        aPageData.num_pages = Math.ceil(iCount / iPageSize);
        res.render('pages/catalog', aPageData);
        
        delete aPageData.total;
        delete aPageData.current_page;
        delete aPageData.num_pages;
    }).
    catch(function(err){
        console.log('Some error: ', err)
    })
});

app.post('/submit_star', function (req, res) {
    aPageData.nav = 'index';
    var data = req.body;
    
    db.collection('stars').count({name: data.name})
    .then(function (bExists) {
        if (bExists) {
            aPageData.star_added = 'This name is already in the Catalog, try another';
        } else {
            aPageData.star_added = 'Adding a star...';
        }
        return getNextSequence('stars')
    })
    .then(function (found) {
        data.created = dt.create().format('Y-m-d H:M:S');
        data.id = found.value.seq;

        db.collection('stars').save(data);
        res.render('pages/index', aPageData);
        delete aPageData.star_added;
    })
    .catch(function (err) {
        console.log('Got some error here: ', err)
    })
});

app.post('/submit_planet', function (req, res) {
    aPageData.nav = 'view_star';
    var data = req.body;
    
    var oStar = null;
    
    db.collection('stars').findOne({_id: new ObjectId(data.star_id)})
    .then(function(res2){
        oStar = res2;
        if (typeof oStar.planets == 'undefined'){
            oStar.planets = [];
        }
        return getNextSequence('planets_'+data.star_id)
    })
    .then(function(found){
        data.created = dt.create().format('Y-m-d H:M:S');
        data.id = found.value.seq;
        oStar.planets.push(data);
        aPageData.data = oStar;
        return db.collection('stars').update({_id: new ObjectId(data.star_id)}, oStar)
    })
    .then(function(res3){
        res.render('pages/view_star', aPageData);
        delete aPageData.data;
    })
    .catch(function (err){
        res.redirect('/');
    })
})

app.get('/view_star', function (req, res) {
    aPageData.nav = 'view_star';
    if (typeof req.query.id == 'undefined'){
        res.redirect('/');
    }
    
    db.collection('stars').findOne({_id: new ObjectId(req.query.id)})
    .then(function(res2){
        console.log('found ', res2)
        aPageData.data = res2;
        res.render('pages/view_star', aPageData);
        delete aPageData.data;
    })
    .catch(function (err) {
        console.log('Got some error here: ', err)
    })
})

app.get('/delete_star', function (req, res){
    if (typeof req.query.id == 'undefined'){
        res.redirect('/catalog');
    }
    
    db.collection('stars').deleteOne({_id: new ObjectId(req.query.id)})
    .then(function(res2){
        res.redirect('/catalog');
    })
    
})

app.use(express.static('public'));

app.listen(app.get('port'), function () {
    console.log('Node app is running on port ', app.get('port'));
});


function getNextSequence(name) {
    var ret = db.collection('counters').findAndModify({_id: name}, {}, {$inc: {seq: 1}}, {
        new : true,
        upsert: true
    });
    return ret;
}