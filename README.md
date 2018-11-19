# npm-safety-updater

This is utility tool for updating npm modules safety.

# Usage

```txt
Usage
  $ safety-update ['major'|'minor'|'patch'|'all']

Options
  --config, Config file path
  --only-prod, Update Only dependency
  --only-dev, Update Only devDependency
  --break, -B, Update include breaking changes
  --force, Skip test command on update
  --manager <'npm'|'yarn'>, Detect your module manager.

Examples
  $ safety-update minor patch --only-dev

for more infomation: https://github.com/pastak/npm-safety-updater
```

1. `echo '{}' > safety-update.config.json` on Project root.
2. `npm i -D npm-safety-update` or `yarn add -D npm-safety-update`
3. `safety-update patch --only-dev`

# Config

```json
{
  "packageFilePath": "path/to/package.json",
  "testCommand": "echo 'no test' && exit 1",
  "afterTest": "",
  "onlyFailed": ""
}
```

## TOOD

- test
