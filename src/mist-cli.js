
if(!process.env.CORE && !process.env.TCP) {
    console.log("Connecting using default parameters, unsecure connection to localhost:9094.");
    process.env.CORE = 'localhost:9094';
    process.env.TCP = '1';
}

var inspect = require("util").inspect;
var bson = require('bson-buffer');
var BSON = new bson();

var useColors = true;
var maxInspectDepth = 10;
var pkg = require("./../package.json");

Core = {};


var Mist = require('mist-api').Mist;
var crypto = require('crypto');

var mist = new Mist();

function MistCli() {
    var self = this;
    this.ids = {};
    this.modelCache = {};
    
    this.repl();
    
    mist.wish('identity.list', [], function (err, data) {
        self.ids = {};
        for(var i in data) {
            self.ids[data[i].uid.toString('hex')] = data[i];
        }
    });
    
    mist.request('signals', [], function(err, data) {
        var signal;
        var payload;
        
        if( Array.isArray(data) ) {
            signal = data[0];
            payload = data[1];
        } else {
            signal = data;
        }
        
        switch (signal) {
            case 'peers':
                //console.log('Change in peers');
                self.updatePeers();
                break;
            default:
                //console.log('Signal other than peers:', signal, payload ? payload : '');
                break;
        }
    });
    
    this.updatePeers();
}

MistCli.prototype.updatePeers = function() {
    mist.request('listPeers', [], this.updatePeersCb.bind(this));
};

MistCli.prototype.updatePeersCb = function(err, peers) {
    this.peers = peers;
    
    if (this.ids) {
        for(var i in this.peers) {
            this.peers[i].l = this.ids[this.peers[i].luid.toString('hex')].alias;
            this.peers[i].r = this.ids[this.peers[i].ruid.toString('hex')].alias;
        }
    }
    
    for(var i in this.peers) {
        var p = this.peers[i];
        // update hash
        var buf = new Buffer(p.luid.toString('hex') + p.ruid.toString('hex') + p.rhid.toString('hex') + p.rsid.toString('hex'), 'hex');
        this.peers[i].hash = crypto.createHash('sha256').update(buf).digest('hex').substr(0, 16);
        
        if (!this.modelCache[this.peers[i].hash]) {
            this.model(this.peers[i]);
        }
    }
    
    //console.log("Updated peers", this.peers);
    this.replCtx.context.peers = this.peers;
};

MistCli.prototype.model = function(peer) {
    var self = this;
    
    mist.request('mist.control.model', [peer], function(err, model) {
        if (err) { return console.log('control.model error for:', peer); }

        //console.log('Got model', model);
        self.modelCache[peer.hash] = model;
    });
};

MistCli.prototype.repl = function() {
    console.log("Welcome to Mist CLI v" + pkg.version);
    
    var methods = {
        listPeers: { args: 'nada', doc: 'list some peerz' },
        'mist.control.model': {},
        'mist.control.read': {},
        'mist.control.write': {},
        'mist.control.invoke': {}
    };

    for (var i in methods) {
        var path = i.split('.');
        var node = Core;
        while (path.length>1) {
            if (!node[path[0]]) {
                node[path[0]] = {};
            }
            node = node[path[0]];
            path.shift();
        }

        node[path[0]] = (function(i) { 
            return function() { 
                var args = [];
                var cb = arguments[arguments.length-1];

                if ( typeof cb !== 'function') { 
                    cb = printResult; 
                    for (var j=0; j < arguments.length; j++) {
                        args.push(arguments[j]);
                    }
                } else {
                    for (var j=0; j < arguments.length-1; j++) {
                        args.push(arguments[j]);
                    }
                }
                mist.request(i, args, cb); 
            };
        })(i);
        //Init help hints
        Object.defineProperty(node[path[0]], "_help_", {value : '('+methods[i].args +') '+ methods[i].doc });
    };

    var repl = require("repl").start({
        prompt: "mist> ",
        input: process.stdin,
        output: process.stdout,
        terminal: true,
        ignoreUndefined: true,
        writer : function (obj) {
            return inspect(obj, maxInspectDepth, null, useColors);
        }
    });

    repl.on("exit", function () {
        mist.shutdown();
        console.log("Bye!");
        process.exit(0);
    });

    function printResult(err, data) {
        if(err) {
            console.log("Error:", data);
        } else {
            console.log(inspect(data, maxInspectDepth, null, useColors));
        }
        repl.context.result = data;
        repl.context.error = err;
    }

    function syncctx() {
        repl.resetContext();
        for(var i in Core) {
            repl.context[i] = Core[i];
        }
        repl.context['BSON'] = BSON;
    }

    syncctx();
    this.replCtx = repl;
};
    
module.exports = {
    MistCli: MistCli };
