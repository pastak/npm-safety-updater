const {execSync} = require('child_process');

module.exports = {
  json: (manager) => {
    try {
      return execSync(`${manager} outdated --json`).toString();
    } catch (e) {
      return e.stdout.toString();
    }
  }
};
