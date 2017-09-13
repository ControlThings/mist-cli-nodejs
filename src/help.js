
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
help['mist.control.requestMapping'] = { short: 'Request to map remote endpoints together', args: 'Peer dst, Peer src, String srcEndpoint, Object srcOpts, String dstEndpoint, Object dstOpts' };

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
help['wish.identity.friendRequest'] = { short: 'Send friend request', args: 'Buffer uid, Cert cert' };

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
help['sandboxed.methods'] = { short: 'Sandboxed methods', args: 'Buffer sandboxId' };
help['sandboxed.mist.control.model'] = { short: 'Model of peer', args: 'Buffer sandboxId, Peer peer' };
help['sandboxed.mist.control.read'] = { short: 'Read current value from peers endpoint', args: 'Buffer sandboxId, Peer peer, String endpoint' };
help['sandboxed.mist.control.write'] = { short: 'Write value to peers endpoint', args: 'Buffer sandboxId, Peer peer, String endpoint, value' };
help['sandboxed.mist.control.invoke'] = { short: 'Invoke peers endpoint', args: 'Buffer sandboxId, Peer peer, String endpoint, value' };
help['sandboxed.mist.control.follow'] = { short: 'Follow changes in peer', args: 'Buffer sandboxId, Peer peer' };
help['sandboxed.wish.identity.list'] = { short: 'List identities', args: 'Buffer sandboxId' };
help['sandboxed.wish.identity.friendRequest'] = { short: 'Send friend request', args: 'Buffer sandboxId, Buffer uid, Cert cert' };


module.exports = help;