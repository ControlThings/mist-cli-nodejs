# Mist Cli

This is bleeding egde software and WILL BREAK from time to time, you have been warned.

This package is dependent on the mist-api package, which currently is working with Linux x64, OSX x64 and Raspberry Pi, on nodejs v6.x only. To get it working you also need to run a Wish Core on the same host.

## Prerequisites

*If you ended up here by accident, you might not get this to work.*

1) Download and install `node.js` v.6.x. (tested on v6.9.2)

2) Download and run wish-core (https://mist.controlthings.fi/developer).

```sh
wget https://mist.controlthings.fi/dist/wish-core-v0.6.8-x64-linux
chmod +x ./wish-core-v0.6.8-x64-linux
./wish-core-v0.6.8-x64-linux
```

3) Get command line tool `wish-cli`

```sh
npm install -g wish-cli
wish-cli
```

4)  Create an identity with `wish-cli`

```javascript
identity.create('John Andersson')
```

## Install and run

```sh
node --version #should return 6.x
npm install -g mist-cli
mist-cli
```

## Develop

```sh
git clone https://github.com/ControlThings/mist-cli-nodejs.git
cd mist-cli-nodejs
npm install
node --version #should return 6.x
node run
```


