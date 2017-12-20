
var help = {};

help['methods'] = { short: 'List available rpc commands', args: '' };
help['version'] = { short: 'Build version', args: '' };
help['listPeers'] = { short: 'List available peers', args: '' };
help['signals'] = { short: 'Subscribe to signals, like changes in peers list, sandboxed requests etc.', args: '' };
help['ready'] = { short: 'Get ready state or if not ready, subscribe to ready', args: '' };
help['getServiceId'] = { short: 'Get Wish App id', args: '' };

help['commission.add'] = { short: 'Add entry to commission list', args: 'ssid: String' };

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
help['wish.relay.list'] = { short: 'List relays', args: '' };
help['wish.relay.add'] = { short: 'Add relay', args: 'relay: String' };
help['wish.relay.remove'] = { short: 'Remove relay', args: 'relay: String' };
help['wish.connections.list'] = { short: 'List connections', args: '' };
help['wish.connections.request'] = { short: 'Send request to remote core', args: 'host: Host, op: String, args: Array' };

help['sandbox.list'] = { short: 'List sandboxes', args: 'sandboxId: SandboxId' };
help['sandbox.remove'] = { short: 'Remove sandbox', args: 'sandboxId: SandboxId' };
help['sandbox.listPeers'] = { short: 'List peers allowed in sandbox', args: 'sandboxId: SandboxId' };
help['sandbox.addPeer'] = { short: 'Add peer to allowed list for sandbox', args: 'sandboxId: SandboxId, Peer peer' };
help['sandbox.removePeer'] = { short: 'Remove peer from allowed list for sandbox', args: 'sandboxId: SandboxId, Peer peer' };
help['sandbox.allowRequest'] = { short: 'Allow a sandboxed request received via signals', args: 'sandboxId: SandboxId, request: Request' };
help['sandbox.denyRequest'] = { short: 'Deny a sandboxed request received via signals', args: 'sandboxId: SandboxId, request: Request' };
help['sandbox.emit'] = { short: 'Emit signal to sandbox', args: 'sandboxId: SandboxId, hint: string, opts: Object' };

help['sandboxed.login'] = { short: 'Login sandboxed app', args: 'sandboxId: SandboxId, String name' };
help['sandboxed.logout'] = { short: 'Log out sandboxed app', args: 'sandboxId: SandboxId' };
help['sandboxed.settings'] = { short: 'Request settings to be shown by sandbox manager', args: 'sandboxId: SandboxId' };
help['sandboxed.listPeers'] = { short: 'List peers in sandbox', args: 'sandboxId: SandboxId' };
help['sandboxed.commission.list'] = { short: 'List commissionable nodes', args: 'sandboxId: SandboxId' };
help['sandboxed.commission.perform'] = { short: 'Commission a node', args: 'sandboxId: SandboxId' };
help['sandboxed.signals'] = { short: 'Subscribe to sandboxed signals for app', args: 'sandboxId: SandboxId' };
help['sandboxed.methods'] = { short: 'Sandboxed methods', args: 'sandboxId: SandboxId' };
help['sandboxed.mist.control.model'] = { short: 'Model of peer', args: 'sandboxId: SandboxId, Peer peer' };
help['sandboxed.mist.control.read'] = { short: 'Read current value from peers endpoint', args: 'sandboxId: SandboxId, Peer peer, String endpoint' };
help['sandboxed.mist.control.write'] = { short: 'Write value to peers endpoint', args: 'sandboxId: SandboxId, Peer peer, String endpoint, value' };
help['sandboxed.mist.control.invoke'] = { short: 'Invoke peers endpoint', args: 'sandboxId: SandboxId, Peer peer, String endpoint, value' };
help['sandboxed.mist.control.follow'] = { short: 'Follow changes in peer', args: 'sandboxId: SandboxId, Peer peer' };
help['sandboxed.wish.signals'] = { short: 'Receive signals from Wish', args: 'sandboxId: SandboxId, core: null | Host' };
help['sandboxed.wish.identity.create'] = { short: 'Create identity', args: 'sandboxId: SandboxId, core: null | Host, alias: String' };
help['sandboxed.wish.identity.get'] = { short: 'Get identity details', args: 'sandboxId: SandboxId, core: null | Host, uid: Uid' };
help['sandboxed.wish.identity.list'] = { short: 'List identities', args: 'sandboxId: SandboxId, core: null | Host' };
help['sandboxed.wish.identity.update'] = { short: 'Update identity meta and alias', args: 'sandboxId: SandboxId, core: null | Host, uid: Uid, meta: Meta' };
help['sandboxed.wish.identity.permissions'] = { short: 'Update identity permissions', args: 'sandboxId: SandboxId, core: null | Host, uid: Uid, permissions: Permisssions' };
help['sandboxed.wish.identity.export'] = { short: 'Export identity', args: 'sandboxId: SandboxId, core: null | Host, uid: Uid' };
help['sandboxed.wish.identity.sign'] = { short: 'Sign document', args: 'sandboxId: SandboxId, core: null | Host, uid: Uid, document: Document' };
help['sandboxed.wish.identity.verify'] = { short: 'Verify document', args: 'sandboxId: SandboxId, core: null | Host, document: Document' };
help['sandboxed.wish.identity.friendRequest'] = { short: 'Send friend request', args: 'sandboxId: SandboxId, core: null | Host, uid: Uid, Cert cert' };
help['sandboxed.wish.identity.friendRequestList'] = { short: 'List friend requests', args: 'sandboxId: SandboxId, core: null | Host' };
help['sandboxed.wish.identity.friendRequestAccept'] = { short: 'Accept friend request', args: 'sandboxId: SandboxId, core: null | Host, luid: Uid, ruid: Uid' };
help['sandboxed.wish.identity.friendRequestDecline'] = { short: 'Decline friend request', args: 'sandboxId: SandboxId, core: null | Host, luid: Uid, ruid: Uid' };


module.exports = help;