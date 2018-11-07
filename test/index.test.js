const {readFileSync} = require('fs');
const safetyUpdate = require('../');
const {resolve} = require('path');

safetyUpdate(['minor', 'patch'], { break: true}, {
  outdatedJson: readFileSync('./test/fixtures/yarn-outdated.json').toString()
});

/*
safetyUpdate('minor', {manager: 'npm'}, {
  outdatedJson: readFileSync('./test/fixtures/npm-outdated.json').toString(),
  packageFilePath: resolve('./test/fixtures/npm-package.json')
})
*/
