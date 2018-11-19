module.exports = (name, packageFilePath) => {
  const pkg = require(packageFilePath || require('path').resolve('package.json'));
  const {devDependencies, dependencies} = pkg;

  console.log(devDependencies);

  if (devDependencies[name]) return 'devDependencies';
  if (dependencies[name]) return 'dependencies';
  return 'unknown';
};
