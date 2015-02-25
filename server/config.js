var config = {
    namespace: 'mysb',
    eventhub: 'mysbhub',
    sasKey: {
        clientName: 'mydevice',
        keyName: 'send',
        key: '9cq7x2DHVg1Vcl3bQNSG7IsdRh9KiPaXiQcYh1SKbcg='
    }
}

config.sasKey.eventHubUri = 'https://' + config.namespace + '.servicebus.windows.net/' + config.eventhub + '/publishers/' + config.sasKey.clientName + '/messages';

module.exports = config;