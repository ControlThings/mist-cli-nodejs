var WebSocket = require('ws');
var Client = require('wish-rpc').Client;
var bson = require('bson-buffer');
var BSON = new bson();

function Directory(repl, printResult, wish) {
    
    // Connect to Directory service for finding friends 
    var ws = new WebSocket('wss://mist.controlthings.fi:3030');

    var client = new Client(function(msg) { ws.send(BSON.serialize(msg)); });

    ws.on('error', function() {
        console.log('Could not connect to directory.');
    });

    ws.on('open', function() {
        // Connected to directory
    });

    ws.on('message', function(message, flags) {
        if ( !flags.binary ) { return; }

        client.messageReceived(BSON.deserialize(message));
    });
    
    return {
        time: function() {
            client.request('time', [], function(err, timestamp) {
                if (err) { return console.log('Error getting time from server', timestamp); }
                
                console.log('Time from directory:', new Date(timestamp), '('+timestamp+')');
            });
        },
        publish: function(uid, directoryData) { console.log('Not implemented.'); },
        unpublish: function(uid) { console.log('Not implemented.'); },
        find: function(alias) { client.request('directory.find', [alias], printResult); }
    };
}

module.exports = {
    Directory: Directory };