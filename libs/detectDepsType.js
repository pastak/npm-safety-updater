module.exports = (name, packageFilePath) => {
  const pkg = require(require('path').resolve(packageFilePath || 'package.json'));

  const {devDependencies, dependencies} = pkg;

  if (devDependencies[name]) return 'devDependencies';
  if (dependencies[name]) return 'dependencies';
  return 'unknown';
};
