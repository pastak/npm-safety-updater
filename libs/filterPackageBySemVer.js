const semver = require('semver');

module.exports = (updateSemVer, outdatedJson, willBreak = false) => {
  if (updateSemVer.includes('all')) return outdatedJson;
  let res = {};
  let allowReleaseType = [];
  if (updateSemVer.includes('major')) {
    allowReleaseType.push('major');
  }
  if (updateSemVer.includes('minor')) {
    allowReleaseType.push('minor');
  }
  if (updateSemVer.includes('patch')) {
    allowReleaseType.push('patch');
  }
  Object.keys(outdatedJson).forEach(key => {
    const item = outdatedJson[key];
    const {current, wanted, latest, type, url} = item;
    const goto = willBreak ? latest : wanted;
    if (
      semver.valid(current) &&
      semver.valid(goto) &&
      allowReleaseType.includes(semver.diff(current, goto))
    ) {
      res[key] = {
        current,
        goto,
        type,
        url
      };
    }
  });
  return res;
};
