const fs = require('fs');
const path = require('path');
const os = require('os');
const child_process = require('child_process');
const detectManager = require('./libs/detectManager');
const outdated = require('./libs/outdated');
const reStylingJson = require('./libs/reStylingJson');
const filterPackageBySemVer = require('./libs/filterPackageBySemVer');

const buildUpdateCommand = (manager, type, name, version) => {
  const flags = type === 'devDependencies' ? '-D ' : '';
  if (manager === 'npm') return `npm install ${flags}${name}@${version}`;
  if (manager === 'yarn') return `yarn add ${flags}${name}@^${version}`;
};
const RESET_COMMAND = {
  npm: 'npm ci',
  yarn: `rm -rf ${path.resolve('node_modules')} && yarn install`
};
const LOCKFILE = {
  npm: 'package-lock.json',
  yarn: 'yarn.lock'
};

const execCommand = (commands, replacer) => {
  let comm = '';
  if (typeof commands === 'string') {
    comm = commands;
  } else if (Array.isArray(commands)) {
    comm = commands.join('&&');
  }
  Object.keys(replacer).forEach(key => {
    const replace = replacer[key];
    comm = comm.replace(`%${key}%`, replace);
  });
  child_process.execSync(comm, {stdio: [0, 1, 2]});
};

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
  let success = [];
  let errors = [];

  execCommand(RESET_COMMAND[manager]);
  if (options.prepare) execCommand(options.prepare);

  Object.keys(outdatedJson)
    .forEach((name, index) => {
      const copiedPackgeJson = 'package.json-' + index;
      const copiedPackageLock = LOCKFILE[manager] + '-' + index;
      fs.copyFileSync(packageJsonPath, path.join(dirPath, copiedPackgeJson));
      fs.copyFileSync(lockFilePath, path.join(dirPath, copiedPackageLock));
      const item = outdatedJson[name];
      const {current, goto, type, url} = item;

      let replace = {
        PACKAGE_NAME: name,
        CURRENT_VERSION: current,
        GOTO_VERSION: goto,
        DEPS_TYPE: type
      };

      const command = buildUpdateCommand(manager, type, name, goto);
      try {
        console.info('RUN:', command);
        if (!process.env.DEBUG) execCommand(command, replace);
        if (!flags.force && options.testCommand) {
          console.info('TEST:', options.testCommand);
          execCommand(options.testCommand, replace);
        }
        success.push([name, current, goto, url]);
        if (options.onlySuccess) execCommand(options.onlySuccess, replace);
      } catch (e) {
        errors.push([e, name]);
        console.error('Failed to update:', name);
        fs.copyFileSync(path.join(dirPath, copiedPackgeJson), packageJsonPath);
        fs.copyFileSync(path.join(dirPath, copiedPackageLock), lockFilePath);
        if (options.onlyFailed) execCommand(options.onlyFailed, replace);
      }
      if (options.afterTest) execCommand(options.afterTest, replace);
      execCommand(RESET_COMMAND[manager], replace);
    });
  console.log('updated info:', updateSemVer.join(','));
  console.log(success.map(i => `UPDATE: ${i[0]} to v${i[2]} from v${i[1]} ${i[3]}`).join('\n'));
  console.log(`====\nfailed to update\n${errors.map(e => e.name).join('\n')}`);
};
