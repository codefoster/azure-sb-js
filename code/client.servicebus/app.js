var azure = require('azure');
var config = require('./config');

var svc = azure.createServiceBusService("Endpoint=sb://" + config.namespace + ".servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=Xaxs/iR6yWWR0ATLtEnNFhKAAq7I2gP7StL6rxAHxZw=");

require('cylon').robot({
    connections: { edison: { adaptor: 'intel-iot' } },
    devices: { analogSensor: { driver: 'analogSensor', pin: 0 } },
    work: function (my) {
        //on some hardware event send a message
        sendMessage('{\"name\":\"widget 1\"}');
    }
}).start();

function sendMessage(msg) {
    svc.sendQueueMessage('mash', message, function () { });
}