# npm-safety-updater

This is utility tool for updating npm modules safety.

# What is it solution for

Updating npm modules is important but it is hard to confirm this update won't break application even if we have unit test and E2E test.

This will execute test commands on each update then if it fails, this will rollback package.json and lockfile.

This makes your updating npm module more safety.

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
2. `npx npm-safety-updater patch --only-dev`

## ⚠️ Caution

**Don't use it via project's node_modules** , use via npx or global install because this command remove project's node_modules directory to refresh dependency (also `npm ci` includes removing node_modules).

# Config

```json
{
  "packageFilePath": "path/to/package.json",
  "prepare": ["npm run build"],
  "testCommand": ["echo 'no test'", "exit 1"],
  "afterTest": "echo 'after test'",
  "onlyFailed": "echo 'test failed'",
  "onlySuccess": "echo 'test success'"
}
```

- `packageFilePath: string`: Specify `package.json` path
- `prepare: string | string[]`: commands execused before updating a module
- `testCommand: string | string[]`: commands for test after updating a module
- `afterTest: string | string[]`: commands execused after test commands
- `onlyFailed: string | string[]`: commands execused when fails test commands
- `onlySuccess: string | string[]`: commands execused when success test commands

## Replacable synbols in commands

- `%PACKAGE_NAME%`
- `%CURRENT_VERSION%`
- `%GOTO_VERSION%`
- `%DEPS_TYPE%`

## TODO

- test
