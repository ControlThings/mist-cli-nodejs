
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
            this.modelCache[this.peers[i].hash] = { device: 'n/a' };
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

var help = {};

help['methods'] = { short: 'List available rpc commands', args: '' };
help['version'] = { short: 'Build version', args: '' };
help['listPeers'] = { short: 'List available peers', args: '' };
help['signals'] = { short: 'Subscribe to signals, like changes in peers list etc.', args: '' };
help['ready'] = { short: 'Get ready state or if not ready, subscribe to ready', args: '' };
help['getServiceId'] = { short: 'Get Wish App id', args: '' };

help['mist.control.model'] = { short: 'Model of peer', args: 'Peer peer' };
help['mist.control.read'] = { short: 'Read current value from peers endpoint', args: 'Peer peer, String endpoint' };
help['mist.control.write'] = { short: 'Write value to peers endpoint', args: 'Peer peer, String endpoint, value' };
help['mist.control.invoke'] = { short: 'Invoke peers endpoint', args: 'Peer peer, String endpoint, value' };
help['mist.control.follow'] = { short: 'Follow changes in peer', args: 'Peer peer' };
help['mist.control.requestMapping'] = { short: 'Request to map remote endpoints togehter', args: 'Peer dst, Peer src, String srcEndpoint, Object srcOpts, String dstEndpoint, Object dstOpts' };

help['mist.manage.claim'] = { short: 'Claim ownership of peer', args: 'Peer peer' };
help['mist.manage.peers'] = { short: 'List peers seen from peer', args: 'Peer peer' };
help['mist.manage.acl.model'] = { short: 'Show access control model from peer', args: 'Peer peer' };
help['mist.manage.acl.allow'] = { short: 'Allow role permission to endpoint in peer', args: 'Peer peer, role, endpoint, permission' };
help['mist.manage.acl.removeAllow'] = { short: 'Remove role permission to endpoint in peer', args: 'Peer peer, role, endpoint, permission' };
help['mist.manage.acl.addUserRoles'] = { short: 'Add user to role in peer', args: 'Peer peer, user, role' };
help['mist.manage.acl.removeUserRoles'] = { short: 'Remove user from role in peer', args: 'Peer peer, user, role' };
help['mist.manage.acl.userRoles'] = { short: 'Enumerate user roles in peer', args: 'Peer peer, user' };
help['mist.manage.user.ensure'] = { short: 'Ensure peer knows user', args: 'Peer peer, Cert user' };

help['wish.identity.list'] = { short: 'List identities', args: '' };

help['sandbox.list'] = { short: 'List sandboxes', args: 'Buffer sandboxId' };
help['sandbox.remove'] = { short: 'Remove sandbox', args: 'Buffer sandboxId' };
help['sandbox.listPeers'] = { short: 'List peers allowed in sandbox', args: 'Buffer sandboxId' };
help['sandbox.addPeer'] = { short: 'Add peer to allowed list for sandbox', args: 'Buffer sandboxId, Peer peer' };
help['sandbox.removePeer'] = { short: 'Remove peer from allowed list for sandbox', args: 'Buffer sandboxId, Peer peer' };

help['sandboxed.login'] = { short: 'Login sandboxed app', args: 'Buffer sandboxId, String name' };
help['sandboxed.logout'] = { short: 'Log out sandboxed app', args: 'Buffer sandboxId' };
help['sandboxed.settings'] = { short: 'Request settings to be shown by sandbox manager', args: 'Buffer sandboxId' };
help['sandboxed.listPeers'] = { short: 'List peers in sandbox', args: 'Buffer sandboxId' };
help['sandboxed.signals'] = { short: 'Subscribe to sandboxed signals for app', args: 'Buffer sandboxId' };
help['sandboxed.mist.control.model'] = { short: 'Model of peer', args: 'Buffer sandboxId, Peer peer' };
help['sandboxed.mist.control.read'] = { short: 'Read current value from peers endpoint', args: 'Buffer sandboxId, Peer peer, String endpoint' };
help['sandboxed.mist.control.write'] = { short: 'Write value to peers endpoint', args: 'Buffer sandboxId, Peer peer, String endpoint, value' };
help['sandboxed.mist.control.invoke'] = { short: 'Invoke peers endpoint', args: 'Buffer sandboxId, Peer peer, String endpoint, value' };
help['sandboxed.mist.control.follow'] = { short: 'Follow changes in peer', args: 'Buffer sandboxId, Peer peer' };
help['sandboxed.wish.identity.list'] = { short: 'List identities', args: 'Buffer sandboxId' };

MistCli.prototype.repl = function() {
    var self = this;
    console.log("\x1b[37mWelcome to Mist CLI v" + pkg.version +"\x1b[39m");
    console.log("\x1b[33mNot everything works as expected! You have been warned.\x1b[39m");
    console.log("Try 'help()' to get started.");
    
    mist.request('methods', [], function(err, methods) {
        if (err) { console.log('Mist API responded with an error.'); process.exit(0); return; }
        
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
                    return mist.request(i, args, function() { console.log(); cb.apply(this, arguments); repl.displayPrompt(); }); 
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
            repl.context['BSON'] = BSON;
            repl.context['help'] = function() {
                console.log('Help:');
                console.log();
                console.log('  list()        List available peers');
                console.log('  cancel(id)    Cancel mist-api request by id');
                console.log();
                console.log('Available commands from mist-api:');
                console.log(inspect(mroot, { colors: true, depth: 10 }));
            };
            repl.context['list'] = (function() {
                console.log('Known peers: (highlighted are online)');
                for(var i in this.peers) {
                    var peer = this.peers[i];
                    console.log((peer.online ? '\x1b[37m' : '\x1b[39m')+'  peers['+i+']:', this.modelCache[peer.hash].device, '('+ this.ids[peer.ruid.toString('hex')].alias +')'+'\x1b[39m');
                }
            }).bind(self);
            repl.context['cancel'] = function(id) {
                mist.requestCancel(id);
            };
        }

        syncctx();
        self.replCtx = repl;
    });
};
    
module.exports = {
    MistCli: MistCli };
