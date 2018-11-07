#!/usr/bin/env node
const meow = require('meow');
const safeUpdater = require('.');

const cli = meow(`
Usage
  $ safety-update ['major'|'minor'|'patch'|'all']

Options
  --only-prod, Update Only dependency
  --only-dev, Update Only devDependency
  --break, -B, Update include breaking changes
  --force, Skip test command on update
  --manager <'npm'|'yarn'>, Detect your module manager.
  --no-emoji

Examples
  $ safety-update minor patch --only-dev

for more infomation: https://github.com/pastak/npm-safety-updater
`, {
  flags: {
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
  try {
    safeUpdater(cli.input, cli.flags);
  } catch (e) {
    console.error(e);
  }
} else {
  cli.showHelp();
}
