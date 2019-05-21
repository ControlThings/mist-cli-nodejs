# Mist Cli

This package is dependent on the mist-api package, which currently is working with Linux x64, OSX x64 and Raspberry Pi, on nodejs v6, v8, v10. To get it working you also need to run a Wish Core on the same host.

## Prerequisites

*If you ended up here by accident, you might not get this to work.*

1) Download and install `node.js` v.6.x. (tested on v6.9.2), v8.x or
   v10.x. 
   
   The node version manager "nvm" works well for this purpose: https://github.com/nvm-sh/nvm

2) Download and run wish-core (choose the desired target platform https://www.controlthings.fi/dev/).

```sh
wget https://www.controlthings.fi/dist/wish-core-v0.10.0-beta-5-x64-linux
chmod +x ./wish-core-v0.10.0-beta-5-x64-linux
./wish-core-v0.10.0-beta-5-x64-linux
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
node --version #should return 6.x, 8.x or 10.x depending on what is your active node.js
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


