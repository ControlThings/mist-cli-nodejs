
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

var crypto = require('crypto');

var help = require('./help.js');
var Directory = require('../deps/directory/directory.js').Directory;

var peerHash = function(peer) {
    var buf = new Buffer(peer.luid.toString('hex') + peer.ruid.toString('hex') + peer.rhid.toString('hex') + peer.rsid.toString('hex'), 'hex');
    return crypto.createHash('sha256').update(buf).digest('hex').substr(0, 16);
};

function MistCli(mist) {
    var self = this;
    
    if (mist) {
        this.mistApi = mist;
    } else {
        var Mist = require('mist-api').Mist;
        this.mistApi = new Mist({ name: 'MistCli', corePort: parseInt(process.env.CORE) });

        this.mistApi.node.create({
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
            },
            debug: {
                type: 'invoke',
                invoke: function(args, peer, cb) {
                    console.log('DEBUG:', args);
                    cb(null, true);
                }
            }
        });

        this.mistApi.node.read('mist.name', function(args, peer, cb) { cb(null, 'MistCli'); });

        /*
        this.mistApi.node.offlineCb = function(peer) {
            var name = self.nameCache[peerHash(peer)] || 'n/a';

            self.mistApi.request('wish.identity.get', [peer.ruid], function(err, data) {
                console.log('\n\x1b[37m'+'offline:', name, '('+ data.alias +') '+'\x1b[39m');
                self.replCtx.displayPrompt();
            });                
        };
        
        this.mistApi.node.onlineCb = function(peer) {
            self.mistApi.request('mist.control.read', [peer, 'mist.name'], function(err, name) {
                if (err) { return console.log('Failed reading peer name', name); }

                self.mistApi.request('wish.identity.get', [peer.ruid], function(err, data) {
                    console.log('\n\x1b[37m'+'online:', name, '('+ data.alias +') '+'\x1b[39m');
                    self.replCtx.displayPrompt();
                });
            });
        };
        */
    }
    
    this.ids = {};
    this.nameCache = {};
    
    // Uid of current user
    this.identity = null;
    
    this.repl();

    this.mistApi.request('signals', [], function(err, data) {
        if (err) { return console.log('signals failed.', data); }
        
        var signal;
        var payload;
        
        if( Array.isArray(data) ) {
            signal = data[0];
            payload = data[1];
        } else {
            signal = data;
        }

        //console.log('Signal:', signal, data);
        
        switch (signal) {
            case 'peers':
                //console.log('Change in peers');
                self.updatePeers();
                break;
            default:
                break;
        }
    });
    
    this.updatePeers();
}

MistCli.prototype.updateIdentities = function() {
    var self = this;
    
    this.mistApi.wish.request('identity.list', [], function (err, data) {
        self.ids = {};
        for(var i in data) {
            self.ids[data[i].uid.toString('hex')] = data[i];
            
            if (self.identity === null && data[i].privkey) {
                self.identity = data[i].uid;
                console.log('\nActing as \033[1m'+ data[i].alias +'\033[0m');
                self.replCtx.displayPrompt();
            }
        }
        
        self.updatePeersCb(null, self.peers);
    });
};

MistCli.prototype.updatePeers = function() {
    this.mistApi.request('listPeers', [], this.updatePeersCb.bind(this));
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
        var peer = this.peers[i];
        // update hash
        this.peers[i].hash = peerHash(peers[i]);
        
        if (!this.nameCache[this.peers[i].hash]) {
            this.nameCache[this.peers[i].hash] = '(n/a)';
            
            (function(peer) {
                self.mistApi.request('mist.control.read', [peer, 'mist.name'], function(err, name) {
                    if (err) {
                        console.log('Failed reading mist.name');
                        name = peer.hash;
                    }

                    self.nameCache[peer.hash] = name;
                });
            })(peer);
        }
    }
    
    //console.log("Updated peers", this.peers);
    this.replCtx.context.peers = this.peers;
};

MistCli.prototype.repl = function() {
    var self = this;
    console.log("\x1b[37mWelcome to Mist CLI v" + pkg.version +"\x1b[39m");
    console.log("\x1b[33mNot everything works as expected! You have been warned.\x1b[39m");
    console.log("Try 'help()' to get started.");
    
    this.mistApi.request('methods', [], function(err, methods) {
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
                    
                    var reqId = self.mistApi.request(i, args, function() { console.log(); cb.apply(this, arguments); repl.displayPrompt(); });
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
                value: (function(args, doc) { return function() { return '\x1b[37m'+doc+' \x1b[33m('+args+')\x1b[39m'; } })(args, doc)
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
            self.mistApi.shutdown();
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
                    var peer = this.peers[i];
                    var alias = this.ids[peer.ruid.toString('hex')] ? this.ids[peer.ruid.toString('hex')].alias : 'n/a';
                    if (peer.online) { none = false; console.log('\x1b[37m'+'  peers['+i+']:', this.nameCache[peer.hash], '('+ alias +') '+'\x1b[39m'); }
                }
                if (none) { console.log('  (no peers found)'); }
            }).bind(self);
            
            repl.context.cancel = function(id) {
                self.mistApi.requestCancel(id);
            };
            
            repl.context.directory = new Directory(repl, printResult, this.mistApi);
            
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
