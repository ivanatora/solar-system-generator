// planet controller

exports.submit = function(req, res, next){
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
        res.redirect('/star/view?id=' + data.star_id);
//        res.render('../../controllers/star/view', aPageData);
        delete aPageData.data;
    })
    .catch(function (err){
        res.redirect('/');
    })
}

exports.delete = function(req, res, next){
    if (typeof req.query.star_id == 'undefined'){
        res.redirect('/star/catalog');
    }
    if (typeof req.query.planet_id == 'undefined'){
        res.redirect('/star/catalog');
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
        res.redirect('/star/view?id='+req.query.star_id);
    })
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
