var config = require('./config');

require('cylon').robot({
    connections: { edison: { adaptor: 'intel-iot' } },
    devices: { analogSensor: { driver: 'analogSensor', pin: 0 } },
    work: function (my) {
        //on some hardware event send a message
        sendMessage('{\"name\":\"widget 1\"}');
    }
}).start();

function sendMessage(msg) {
    // Send the request to the Event Hub
    
    var options = {
        hostname: config.namespace + '.servicebus.windows.net',
        port: 443,
        path: '/' + config.eventhub + '/publishers/' + config.deviceName + '/messages',
        method: 'POST',
        headers: {
            'Authorization': "{SAS_TOKEN}", //request from /api/gettoken to get a token
            'Content-Length': message.length,
            'Content-Type': 'application/atom+xml;type=entry;charset=utf-8'
        }
    };
    
    var req = https.request(options, function (res) {
        console.log("statusCode: ", res.statusCode);
        console.log("headers: ", res.headers);
        
        res.on('data', function (d) {
            process.stdout.write(d);
        });
    });

    req.on('error', function (e) {
        console.error(e);
    });
    
    req.write(message);
    req.end();
}