const fs = require('fs');
const path = require('path');
const os = require('os');
const child_process = require('child_process');
const detectManager = require('./libs/detectManager');
const outdated = require('./libs/outdated');
const reStylingJson = require('./libs/reStylingJson');
const filterPackageBySemVer = require('./libs/filterPackageBySemVer');

const UPDATE_COMMAND = {
  npm: 'install',
  yarn: 'add'
};
const LOCKFILE = {
  npm: 'package-lock.json',
  yarn: 'yarn.lock'
};

const execCommand = (commands) => {
  let comm = '';
  if (typeof commands === 'string') {
    comm = commands;
  } else if (Array.isArray(commands)) {
    comm = commands.join('&&');
  }
  child_process.execSync(comm);
}

module.exports = (updateSemVer, flags = {}, options = {}) => {
  let manager = flags.manager;
  if (!manager) manager = detectManager();
  let outdatedJson = options.outdatedJson;
  if (!outdatedJson) outdatedJson = outdated.json(manager);
  if (manager === 'yarn') {
    outdatedJson = outdatedJson.split('\n')[1];
  }
  outdatedJson = reStylingJson(manager, outdatedJson, options.packageFilePath);

  let onlyDeps = '';
  if (flags.onlyDev) {
    onlyDeps = 'devDependencies';
  }

  if (flags.onlyProd) {
    onlyDeps = 'dependencies';
  }

  if (onlyDeps) {
    let r = {};
    Object.keys(outdatedJson)
      .filter(key => outdatedJson[key].type === onlyDeps)
      .forEach(key => {
        r[key] = outdatedJson[key];
      });
    outdatedJson = r;
  }
  outdatedJson = filterPackageBySemVer(updateSemVer, outdatedJson, flags.break);
  const dirPath = fs.mkdtempSync(path.join(os.tmpdir(), 'npm-safety-update-'));
  const packageJsonPath = path.resolve('package.json');
  const lockFilePath = path.resolve(`${LOCKFILE[manager]}`);
  fs.copyFileSync(packageJsonPath, path.join(dirPath, 'package.json--1'));
  fs.copyFileSync(lockFilePath, path.join(dirPath, LOCKFILE[manager] + '--1'));
  let success = [];
  let errors = [];
  Object.keys(outdatedJson)
    .forEach((name, index) => {
      fs.copyFileSync(packageJsonPath, path.join(dirPath, 'package.json-' + index));
      fs.copyFileSync(lockFilePath, path.join(dirPath, LOCKFILE[manager] + '-' + index));
      const item = outdatedJson[name];
      const {current, goto, type, url} = item;
      const command = `${manager} ${UPDATE_COMMAND[manager]} ${type === 'devDependencies' ? '-D ' : ''}${name}@${goto}`;
      try {
        console.info('RUN:', command);
        if (!process.env.DEBUG) child_process.execSync(command);
        if (!flags.force && options.testCommand) {
          console.info('TEST:', options.testCommand);
          execCommand(options.testCommand);
        }
        success.push([name, current, goto, url]);
      } catch (e) {
        errors.push([e, name]);
        console.error('Failed to update:', name);
        fs.copyFileSync(path.join(dirPath, 'package.json-' + (index - 1)), packageJsonPath);
        fs.copyFileSync(path.join(dirPath, LOCKFILE[manager] + '-' + (index - 1)), lockFilePath);
      }
      execCommand(options.afterTest);
    });
  console.log('updated info:', updateSemVer.join(','));
  console.log(success.map(i => `UPDATE: ${i[0]} to v${i[2]} from v${i[1]} ${i[3]}`).join('\n'));
};
