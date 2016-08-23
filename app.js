var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
    response.render('pages/index');
});

app.use(express.static('public'));

app.listen(app.get('port'), function() {
    console.log('Node app is running on port ', app.get('port'));
});
