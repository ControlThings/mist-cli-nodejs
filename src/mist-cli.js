
if(!process.env.CORE) {
    console.log("Connecting using default parameters, localhost:9094. Use env CORE=<port> for connecting to other port");
    process.env.CORE = '9094';
}

var inspect = require("util").inspect;
var bson = require('bson-buffer');
var BSON = new bson();

var useColors = true;
var maxInspectDepth = 10;
var pkg = require("./../package.json");

var Mist = require('mist-api').Mist;
var crypto = require('crypto');

var help = require('./help.js');
var Directory = require('../deps/directory/directory.js').Directory;

var mist = new Mist({ name: 'MistCli', corePort: parseInt(process.env.CORE) });

mist.create({
    mist: {
        type: 'string',
        '#': {
            name: {
                label: 'Name',
                type: 'string',
                read: true
            }
        }
    },
    // dummy needed due to bug in mist-api
    ep: {
        type: 'int',
        read: true
    }
});

mist.update('mist.name', 'MistCli');

function MistCli() {
    var self = this;
    this.ids = {};
    this.modelCache = {};
    this.nameCache = {};
    
    // Uid of current user
    this.identity = null;
    
    this.repl();

    mist.request('signals', [], function(err, data) {
        if (err) { return console.log('signals failed.', data); }
        
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

MistCli.prototype.updateIdentities = function() {
    var self = this;
    
    mist.wish('identity.list', [], function (err, data) {
        self.ids = {};
        for(var i in data) {
            self.ids[data[i].uid.toString('hex')] = data[i];
            
            if (self.identity === null && data[i].privkey) {
                self.identity = data[i].uid;
                console.log('Acting as \033[1m'+ data[i].alias +'\033[0m');
                self.replCtx.displayPrompt();
            }
        }
        
        self.updatePeersCb(null, self.peers);
    });
};

MistCli.prototype.updatePeers = function() {
    mist.request('listPeers', [], this.updatePeersCb.bind(this));
};

MistCli.prototype.updatePeersCb = function(err, peers) {
    if (err) { return console.log('listPeers returned error', peers); }
    
    var self = this;
    this.peers = peers;

    var problem = false;
    
    if (this.ids) {
        for(var i in this.peers) {
            try {
                this.peers[i].l = this.ids[this.peers[i].luid.toString('hex')].alias;
                this.peers[i].r = this.ids[this.peers[i].ruid.toString('hex')].alias;
            } catch (e) {
                // failed to get alias for this peer
                this.peers[i].l = 'n/a';
                this.peers[i].r = 'n/a';

                // mark as problem, will update the identity list
                problem = true;
            }
        }
    }
    
    if (problem) {
        // try to update identity list
        self.updateIdentities();
    }
    
    for(var i in this.peers) {
        var p = this.peers[i];
        // update hash
        var buf = new Buffer(p.luid.toString('hex') + p.ruid.toString('hex') + p.rhid.toString('hex') + p.rsid.toString('hex'), 'hex');
        this.peers[i].hash = crypto.createHash('sha256').update(buf).digest('hex').substr(0, 16);
        
        if (!this.modelCache[this.peers[i].hash]) {
            this.modelCache[this.peers[i].hash] = { device: 'n/a' };
            this.model(this.peers[i]);
        }
    }
    
    //console.log("Updated peers", this.peers);
    this.replCtx.context.peers = this.peers;
};

MistCli.prototype.model = function(peer) {
    var self = this;

    function readOldModel(peer) {
        mist.request('mist.control.model', [peer], function(err, model) {
            if (err) { return console.log('Trying to read old model: control.model error for:', peer); }

            if (model.device) {
                // old model
                self.modelCache[peer.hash] = model.model;
                self.nameCache[peer.hash] = model.device;
                return;
            }

            self.modelCache[peer.hash] = model;
        });
    }

    mist.request('mist.control.read', [peer, 'mist.name'], function(err, name) {
        if (err) { return readOldModel(peer); }

        self.nameCache[peer.hash] = name;
    });
};

MistCli.prototype.repl = function() {
    var self = this;
    console.log("\x1b[37mWelcome to Mist CLI v" + pkg.version +"\x1b[39m");
    console.log("\x1b[33mNot everything works as expected! You have been warned.\x1b[39m");
    console.log("Try 'help()' to get started.");
    
    mist.request('methods', [], function(err, methods) {
        if (err) { console.log('Mist API responded with an error.', methods); process.exit(0); return; }
        
        var mroot = {};
    
        for (var i in methods) {
            var path = i.split('.');
            var node = mroot;
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
                    
                    var reqId = mist.request(i, args, function() { console.log(); cb.apply(this, arguments); repl.displayPrompt(); });
                    console.log('reqId: '+ reqId);
                };
            })(i);
            //Init help hints
            //Object.defineProperty(node[path[0]], "_help_", {value : '('+methods[i].args +') '+ methods[i].doc });
            
            var args = help[i] && help[i].args ? help[i].args : '';
            var doc = help[i] && help[i].short ? help[i].short : 'n/a';
            
            Object.defineProperty(node[path[0]], "inspect", {
                enumerable: false,
                configurable: false,
                writable: false,
                value: (function(args, doc) { return function() { return '\x1b[33m('+args+')\x1b[37m '+doc+'\x1b[39m'; } })(args, doc)
            });
        };

        var repl = require("repl").start({
            prompt: "mist> ",
            input: process.stdin,
            output: process.stdout,
            terminal: true,
            ignoreUndefined: true,
            writer: function (obj) {
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
            
            for(var i in mroot) {
                repl.context[i] = mroot[i];
            }
            
            repl.context.BSON = BSON;
            
            repl.context.help = function() {
                console.log('Help:');
                console.log();
                console.log('  list()        List available peers');
                console.log('  cancel(id)    Cancel mist-api request by id');
                console.log();
                console.log('Available commands from mist-api:');
                console.log(inspect(mroot, { colors: true, depth: 10 }));
                console.log();
                console.log('Example:');
                console.log();
                console.log('  list()');
                console.log('  mist.control.model(peers[2])');
                console.log("  mist.control.follow(peers[2])                    // set followId = request id returned");
                console.log("  mist.control.write(peers[2], 'lamp', true)");
                console.log("  cancel(followId)                                 // stops updates");
                console.log('');
                console.log("\x1b[32mHave fun, but remember that this is bleeding egde of the development and WILL BREAK from time to time.\x1b[39m");
            };
            
            repl.context.list = (function() {
                console.log('Known peers:');
                var none = true;
                for(var i in this.peers) {
                    none = false;
                    var peer = this.peers[i];
                    var alias = this.ids[peer.ruid.toString('hex')] ? this.ids[peer.ruid.toString('hex')].alias : 'n/a';
                    console.log('\x1b[37m'+'  peers['+i+']:', this.nameCache[peer.hash], '('+ alias +') '+(peer.online ? '':'offline')+'\x1b[39m');
                }
                if (none) { console.log('  (no peers found)'); }
            }).bind(self);
            
            repl.context.cancel = function(id) {
                mist.requestCancel(id);
            };
            
            repl.context.directory = new Directory(repl, printResult, mist);
            
            repl.context.invite = (function(expert, peer) {
                console.log('\033[1m'+this.ids[this.identity.toString('hex')].alias+'\033[0m'+ ' inviting \033[1m'+ expert.alias +'\033[0m to \033[1m'+ this.modelCache[peer.hash].device +'\033[0m');

                if (!this.identity) { return console.log('No identity to use.'); }
                
                mroot.wish.connections.list()
                
            }).bind(self);
        }

        syncctx();
        self.replCtx = repl;
    });
};
    
module.exports = {
    MistCli: MistCli };
