const {execSync} = require('child_process');

module.exports = {
  json: (manager) => {
    return execSync(`${manager} outdated --json`).toString();
  }
};
