var azure = require('azure');
var config = require('./config');

var serviceBusService = azure.createServiceBusService("Endpoint=sb://" + config.namespace + ".servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=Xaxs/iR6yWWR0ATLtEnNFhKAAq7I2gP7StL6rxAHxZw=");

readMsg();

function readMsg() {
    serviceBusService.receiveQueueMessage('mash', function (msg) {
        console.log('handling queue message ' + msg);
    });
    setTimeout(readMsg, 1000);
}
