dt = require('node-datetime');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var logger = require('morgan');

var app = express();
aPageData = {
    nav: ''
};

db = null;
var MongoClient = require('mongodb').MongoClient
MongoClient.connect('mongodb://test:test@ds013926.mlab.com:13926/solar-systems', function (err, database) {
    console.log('Db connected!')
    db = database;
})
ObjectId = require('mongodb').ObjectID;

// mvc according to https://github.com/expressjs/express/tree/master/examples/mvc

// define a custom res.message() method
// which stores messages in the session
app.response.message = function (msg) {
    // reference `req.session` via the `this.req` reference
    var sess = this.req.session;
    // simply add the msg to an array for later
    sess.messages = sess.messages || [];
    sess.messages.push(msg);
    return this;
};

if (!module.parent) app.use(logger('dev'));


app.use(express.static('public'));
app.use('/files', express.static('files'));

// session support
app.use(session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: 'some secret here'
}));

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({// to support URL-encoded bodies
    extended: true
}));

// allow overriding methods in query (?_method=put)
app.use(methodOverride('_method'));

// expose the "messages" local variable when views are rendered
app.use(function (req, res, next) {
    var msgs = req.session.messages || [];

    // expose "messages" local variable
    res.locals.messages = msgs;

    // expose "hasMessages"
    res.locals.hasMessages = !!msgs.length;

    next();
    // empty or "flush" the messages so they
    // don't build up
    req.session.messages = [];
});

// load controllers
require('./lib/boot')(app, { verbose: !module.parent });

app.use(function(err, req, res, next) {
    // log it
    if (!module.parent)
        console.error(err.stack);

    // error page
    res.status(500).render('5xx');
});

// assume 404 since no middleware responded
app.use(function (req, res, next) {
    res.status(404).render('404', {url: req.originalUrl});
});

/* istanbul ignore next */
//if (!module.parent) {
//    app.listen(3000);
//    console.log('Express started on port 3000');
//}


app.set('port', (process.env.PORT || 5000));

app.listen(app.get('port'), function () {
    console.log('Node app is running on port ', app.get('port'));
});

//app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


getNextSequence = function(name) {
    var ret = db.collection('counters').findAndModify({_id: name}, {}, {$inc: {seq: 1}}, {
        new : true,
        upsert: true
    });
    return ret;
}

