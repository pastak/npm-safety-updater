const {existsSync} = require('fs');

const YARN_LOCK = 'yarn.lock';
const NPM_LOCK = 'package-lock.json';

const maybeYarn = () => {
  return existsSync(YARN_LOCK);
};

const maybeNpm = () => {
  return existsSync(NPM_LOCK);
};

module.exports = () => {
  if (maybeYarn()) return 'yarn';
  if (maybeNpm()) return 'npm';
  throw new Error('cannot detect your package manager');
};
