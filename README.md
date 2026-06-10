# setup-protoc

[![Check npm Dependencies status](https://github.com/SierraSoftworks/setup-protoc/actions/workflows/check-npm-dependencies-task.yml/badge.svg)](https://github.com/SierraSoftworks/setup-protoc/actions/workflows/check-npm-dependencies-task.yml)
![test](https://github.com/SierraSoftworks/setup-protoc/workflows/test/badge.svg)
[![Sync Labels status](https://github.com/SierraSoftworks/setup-protoc/actions/workflows/sync-labels-npm.yml/badge.svg)](https://github.com/SierraSoftworks/setup-protoc/actions/workflows/sync-labels-npm.yml)
[![Check Markdown status](https://github.com/SierraSoftworks/setup-protoc/actions/workflows/check-markdown-task.yml/badge.svg)](https://github.com/SierraSoftworks/setup-protoc/actions/workflows/check-markdown-task.yml)
[![Check License status](https://github.com/SierraSoftworks/setup-protoc/actions/workflows/check-license.yml/badge.svg)](https://github.com/SierraSoftworks/setup-protoc/actions/workflows/check-license.yml)
[![Check Taskfiles status](https://github.com/SierraSoftworks/setup-protoc/actions/workflows/check-taskfiles.yml/badge.svg)](https://github.com/SierraSoftworks/setup-protoc/actions/workflows/check-taskfiles.yml)
[![Integration Tests status](https://github.com/SierraSoftworks/setup-protoc/actions/workflows/test-integration.yml/badge.svg)](https://github.com/SierraSoftworks/setup-protoc/actions/workflows/test-integration.yml)
[![Check npm status](https://github.com/SierraSoftworks/setup-protoc/actions/workflows/check-npm-task.yml/badge.svg)](https://github.com/SierraSoftworks/setup-protoc/actions/workflows/check-npm-task.yml)
[![Check TypeScript status](https://github.com/SierraSoftworks/setup-protoc/actions/workflows/check-typescript-task.yml/badge.svg)](https://github.com/SierraSoftworks/setup-protoc/actions/workflows/check-typescript-task.yml)
[![Check tsconfig status](https://github.com/SierraSoftworks/setup-protoc/actions/workflows/check-tsconfig-task.yml/badge.svg)](https://github.com/SierraSoftworks/setup-protoc/actions/workflows/check-tsconfig-task.yml)

This action makes the `protoc` compiler available to Workflows.

## Upgrade from v1 to v2 or v3

Added support **only** for the new protobuf tag naming convention `MINOR.PATCH`.

## Usage

To get the latest stable version of `protoc` just add this step:

```yaml
- name: Install Protoc
  uses: SierraSoftworks/setup-protoc@v3
```

If you want to pin a major or minor version you can use the `.x` wildcard:

```yaml
- name: Install Protoc
  uses: SierraSoftworks/setup-protoc@v3
  with:
    version: "23.x"
```

You can also require to include releases marked as `pre-release` in Github using the `include-pre-releases` flag (the dafault value for this flag is `false`)

```yaml
- name: Install Protoc
  uses: SierraSoftworks/setup-protoc@v3
  with:
    version: "23.x"
    include-pre-releases: true
```

To pin the exact version:

```yaml
- name: Install Protoc
  uses: SierraSoftworks/setup-protoc@v3
  with:
    version: "23.2"
```

The action queries the GitHub API to fetch releases data, to avoid rate limiting,
pass the default token with the `repo-token` variable:

```yaml
- name: Install Protoc
  uses: SierraSoftworks/setup-protoc@v3
  with:
    repo-token: ${{ secrets.GITHUB_TOKEN }}
```

## Enable verbose logging for a pipeline

Additional log events with the prefix ::debug:: can be enabled by setting the secret `ACTIONS_STEP_DEBUG` to `true`.

See [step-debug-logs](https://github.com/actions/toolkit/blob/master/docs/action-debugging.md#step-debug-logs) for reference.

## Security

If you think you found a vulnerability or other security-related bug in this project, please read our
[security policy](https://github.com/SierraSoftworks/setup-protoc/security/policy) and report the bug
privately via [GitHub's private vulnerability reporting](https://github.com/SierraSoftworks/setup-protoc/security/advisories/new) 🛡️
Thank you!

## Contributing

To report bugs or make feature requests, please submit an issue: https://github.com/SierraSoftworks/setup-protoc/issues

Pull requests are welcome! Please see the [contribution guidelines](.github/CONTRIBUTING.md) for information.

## Credits

This action is a fork of [arduino/setup-protoc](https://github.com/arduino/setup-protoc),
originally created and maintained by Arduino. Thank you to the original authors for their work.
