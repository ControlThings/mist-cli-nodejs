# Mist Cli

This package is dependent on the mist-api package, which currently is working with Linux x64/ia32, OSX x64 and Raspberry Pi, on nodejs v6.x only. To get it working you also need to run a Wish Core on the same host.

## Prerequisites

*If you ended up here by accident, you might not get this to work.*

1) Download and install `node.js` v.6.x. (tested on v6.9.2)

2) Download and run wish-core (choose the desired target platform https://www.controlthings.fi/dev/).

```sh
wget https://www.controlthings.fi/dist/wish-core-v0.8.0-beta-3-x64-linux
chmod +x ./wish-core-v0.8.0-beta-3-x64-linux
./wish-core-v0.8.0-beta-3-x64-linux
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


