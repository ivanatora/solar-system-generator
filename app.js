var dt = require('node-datetime');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var aPageData = {
    nav: ''
};

app.use(express.static('public'));
app.use('/files', express.static('files'));

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
        return drawSolarSystem(data.star_id);
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
        aPageData.data = res2;
        aPageData.custom_nav = res2.name;
        res.render('pages/view_star', aPageData);
        delete aPageData.data;
        delete aPageData.custom_nav;
    })
    .catch(function (err) {
        console.log('Got some error here: ', err)
    })
})

app.get('/draw_star', function (req, res) {
    if (typeof req.query.id == 'undefined'){
        res.redirect('/catalog');
    }
    
    drawSolarSystem(req.query.id)
    .then(function(sFilename){
        res.redirect('/files/'+sFilename);
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

app.get('/delete_planet', function (req, res){
    if (typeof req.query.star_id == 'undefined'){
        res.redirect('/catalog');
    }
    if (typeof req.query.planet_id == 'undefined'){
        res.redirect('/catalog');
    }
    
    db.collection('stars').findOne({_id: new ObjectId(req.query.star_id)})
    .then(function(res2){
        var aNewPlanets = [];
        for (var i in res2.planets){
            if (res2.planets[i].id != req.query.planet_id){
                aNewPlanets.push(res2.planets[i])
            }
        }
        res2.planets = aNewPlanets;
        
        return db.collection('stars').updateOne({_id: new ObjectId(req.query.star_id)}, res2)
    })
    .then(function(){
        return drawSolarSystem(req.query.star_id);
    })
    .then(function(){
        res.redirect('/view_star?id='+req.query.star_id);
    })
})

app.get('/perlin', function (req, res){
    var iWidth = 300;
    var iHeight = 300;
    
    var gd = require('node-gd');
    var perlin = require('perlin-noise');
    var fs = require('fs');
    var aPerlin = perlin.generatePerlinNoise(iWidth, iHeight, {
        octaveCount: 5, // defaults to 4
        amplitude: 0.1, // defaults to 0.1
        persistance: 0.2, // defaults to 0.2
    });
    
    var img = gd.createTrueColorSync(iWidth, iHeight);
    
    var aHistogram = [];
    
    for (var i = 0; i < iWidth; i++){
        for (var j = 0; j < iHeight; j++){
            var iNoiseToColor = Math.round(aPerlin[i + j * iHeight] * 255);
            
            if (typeof aHistogram[iNoiseToColor] == 'undefined') aHistogram[iNoiseToColor] = 0;
            aHistogram[iNoiseToColor]++;
            
            var oColor = img.colorAllocate(iNoiseToColor, iNoiseToColor, iNoiseToColor)
            img.setPixel(i, j, oColor);
        }
    }
    
    console.log('histogram', aHistogram)
    
    var time = Math.floor(new Date() / 1000);
    var sFilename = require('crypto').createHash('md5').update(time.toString()).digest("hex") + '.png';
    img.saveFile('files/'+sFilename);
    img.destroy();
    
//    console.log('perlin ', x)
    res.sendFile(__dirname + '/files/'+sFilename, function(){
        fs.unlinkSync('files/'+sFilename);
    });
})

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

function drawSolarSystem(id){
    var gd = require('node-gd');
    var fs = require('fs');
    
    if (!fs.existsSync('files')){
        fs.mkdirSync('files');
    }
    
    //var time = Math.floor(new Date() / 1000);
    //var sFilename = require('crypto').createHash('md5').update(time.toString()).digest("hex") + '.png';
    var sFilename = id+'.png';
//    console.log('calculated filename: ', sFilename)
    
    return db.collection('stars').findOne({_id: new ObjectId(id)})
    .then(function(res){
//        console.log('drawing solar system: ' , res);
        var img = gd.createSync(600, 600);
        var color0 = img.colorAllocate(30, 30, 30); // background ? blackish
        var white = img.colorAllocate(255, 255, 255);
        
        var star_color = null;
        if (res.class.match('red')){
            star_color = img.colorAllocate(255, 0, 0);
        }
        if (res.class.match('orange')){
            star_color = img.colorAllocate(255, 153, 51);
        }
        if (res.class.match('yellow')){
            star_color = img.colorAllocate(255, 255, 102);
        }
        if (res.class.match('yellow white')){
            star_color = img.colorAllocate(255, 255, 153);
        }
        if (res.class.match('white')){
            star_color = img.colorAllocate(255, 255, 255);
        }
        if (res.class.match('blue white')){
            star_color = img.colorAllocate(153, 230, 255);
        }
        if (res.class.match('blue')){
            star_color = img.colorAllocate(0, 191, 255);
        }
        if (res.class.match('Giant')){
            star_color = img.colorAllocate(179, 0, 0);
        }

        img.filledArc(300, 300, 15, 15, 0, 360, star_color, 4); // star itself
        
        // planet orbits
        var iTotalRadiusPixels = 300 - 10; // don't put it right on the edge of the img
        var iLargestRadius = 0;
        for (var i in res.planets){
            if (res.planets[i].orbital_radius > iLargestRadius) iLargestRadius = res.planets[i].orbital_radius;
        }
        var iAuToPixelRatio = iTotalRadiusPixels / iLargestRadius;
//        console.log('iAuToPixelRatio ', iAuToPixelRatio)
                    
        for (var i in res.planets){
            var iPlanetColor = img.colorAllocate(whiteishColor(), whiteishColor(), whiteishColor())
//            console.log('draw for planet ', res.planets[i])
            var iPixelRadius = Math.ceil(res.planets[i].orbital_radius * iAuToPixelRatio);
            if (res.planets.length == 1){ // one planet at fixed orbital radius
                iPixelRadius = 150;
            }
            
//            console.log('radius selected', iPixelRadius)
            
            var oPlanetCoords = getRandomPlanetCoords(iPixelRadius, 300, 300);
//            console.log('random coords ', oPlanetCoords)
            
            img.arc(300, 300, iPixelRadius * 2, iPixelRadius * 2, 0, 360, iPlanetColor); // orbit
            img.filledArc(oPlanetCoords.x, oPlanetCoords.y, 10, 10, 0, 360, iPlanetColor, 4); // planet itself
        }

        img.saveFile('files/'+sFilename);
        img.destroy();
        
//        console.log('draw ready')
        
        return sFilename;
    })
}

function getRandomPlanetCoords(iRadius, iOffsetX, iOffsetY){
    var iAngle = Math.random() * Math.PI * 2;
    
    return {
        x: Math.ceil(Math.cos(iAngle) * iRadius + iOffsetX),
        y: Math.ceil(Math.sin(iAngle) * iRadius + iOffsetY)
    }
}

function whiteishColor(){
    return Math.ceil(Math.random() * 100) + 155;
}