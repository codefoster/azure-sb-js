var http = require('http');
var path = require('path');
var express = require('express');
var config = require('./config');

var app = express();

app.set('port', process.env.PORT || 1); 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

//routes
app.get('/', function (req, res) {
    //res.render('index', {});
    res.write('hi');
    res.end();
});

//this api route simply generates a SAS token
//it's here on the server because it's not safe to keep your key on the client
app.get('/api/gettoken', function (req, res){
    var https = require('https');
    var crypto = require('crypto');
    var moment = require('moment');
    
   
    // Create a SAS token
    // See http://msdn.microsoft.com/library/azure/dn170477.aspx
    
    function create_sas_token(uri, key_name, key) {
        var expiry = moment().add(1, 'days').unix();
        
        var string_to_sign = encodeURIComponent(uri) + '\n' + expiry;
        var hmac = crypto.createHmac('sha256', key);
        hmac.update(string_to_sign);
        var signature = hmac.digest('base64');
        var token = 'SharedAccessSignature sr=' + encodeURIComponent(uri) + '&sig=' + encodeURIComponent(signature) + '&se=' + expiry + '&skn=' + key_name;
        
        return token;
    }
    
    res.json({ token: create_sas_token(config.sasKey.eventHubUri, config.sasKey.keyName, config.sasKey.key) });
})

var server = http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

module.exports = app;
