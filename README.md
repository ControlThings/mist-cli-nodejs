# Mist Cli

Dependent on the mist-api package, which currently is working with Linux x64 and nodejs v6.x only. To get it working you also need to run a Wish Core on the same host.

## Prerequisites

Download and run wish-core (https://mist.controlthings.fi/developer).

```sh
./wish-core-v0.6.6-stable3-linux-x64
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


