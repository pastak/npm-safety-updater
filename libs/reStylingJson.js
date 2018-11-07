const detectDepsType = require('./detectDepsType');

module.exports = (manager, inputJson, packageFilePath) => {
  let json = manager === 'yarn' ? JSON.parse(inputJson).data.body : JSON.parse(inputJson);
  if (manager === 'yarn' && Array.isArray(json)) {
    let res = {};
    json.forEach(item => {
      const [name, current, wanted, latest, type, url] = item;
      res[name] = {
        current, wanted, latest, type, url
      };
    });
    json = res;
  }
  if (manager === 'npm') {
    let res = {};
    Object.keys(json).forEach(name => {
      const item = json[name];
      if (!item.current) return;
      const {current, wanted, latest} = item;
      
      const type = detectDepsType(name, packageFilePath);
      if (type === 'unknown') return;
      
      const url = '';

      res[name] = {
        current, wanted, latest, type, url
      };
    });
    json = res;
  }
  return json;
};
