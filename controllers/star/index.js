// star controller

exports.index = function(req, res, next){
    aPageData.nav = 'index';
    res.render('index', aPageData);
}

exports.catalog = function(req, res, next){
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
        res.render('catalog', aPageData);
        
        delete aPageData.total;
        delete aPageData.current_page;
        delete aPageData.num_pages;
    }).
    catch(function(err){
        console.log('Some error: ', err)
    })
}

exports.submit = function(req, res, next){
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
        res.render('index', aPageData);
        delete aPageData.star_added;
    })
    .catch(function (err) {
        console.log('Got some error here: ', err)
    })
}

exports.view = function(req, res, next){
    aPageData.nav = 'view_star';
    if (typeof req.query.id == 'undefined'){
        res.redirect('/');
    }
    
    db.collection('stars').findOne({_id: new ObjectId(req.query.id)})
    .then(function(res2){
        aPageData.data = res2;
        aPageData.custom_nav = res2.name;
        res.render('view', aPageData);
        delete aPageData.data;
        delete aPageData.custom_nav;
    })
    .catch(function (err) {
        console.log('Got some error here: ', err)
    })
}

exports.delete = function(req, res, next){
    if (typeof req.query.id == 'undefined'){
        res.redirect('/star/catalog');
    }
    
    db.collection('stars').deleteOne({_id: new ObjectId(req.query.id)})
    .then(function(res2){
        res.redirect('/star/catalog');
    })
}
