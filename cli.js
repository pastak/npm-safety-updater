#!/usr/bin/env node
const meow = require('meow');
const fs = require('fs');
const getStdin = require('get-stdin');
const safeUpdater = require('.');

const cli = meow(`
Usage
  $ safety-update ['major'|'minor'|'patch'|'all']

Options
  --config, Config file path
  --only-prod, Update Only dependency
  --only-dev, Update Only devDependency
  --break, -B, Update include breaking changes
  --force, Skip test command on update
  --manager <'npm'|'yarn'>, Detect your module manager.

Examples
  $ safety-update minor patch --only-dev

for more infomation: https://github.com/pastak/npm-safety-updater
`, {
  flags: {
    config: {
      type: 'string',
      default: 'safety-update.config.json'
    },
    onlyProd: {
      type: 'boolean',
      default: false
    },
    onlyDev: {
      type: 'boolean',
      default: false
    },
    break: {
      type: 'boolean',
      default: false,
      alias: 'B'
    },
    force: {
      type: 'boolean',
      default: false
    },
    manager: {
      type: 'string'
    },
    emoji: {
      type: 'boolean',
      default: true
    }
  }
});

if (cli.input.length > 0) {
  const configPath = require('path').resolve(cli.flags.config);
  const existConfig = fs.existsSync(configPath);

  let config;
  if (existConfig) {
    try {
      config = JSON.parse(fs.readFileSync(configPath).toString());
    } catch (e) { } // eslint-disable-line 
  } else {
    return console.log('Require safety-update.config.json or use --config');
  }

  try {
    getStdin()
      .then(() => safeUpdater(cli.input, cli.flags, config));
  } catch (e) {
    console.error(e);
  }
} else {
  cli.showHelp();
}
