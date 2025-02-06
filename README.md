<img alt="Check" src="packages/node-test-reporter-github/octicons/check-circle-fill-16.svg" align="right" width="64vw">

[`npm`] Package [CI]
====================
Simple CI GitHub [Action] for your [[`p`]]`npm` [package]s.

Usage
-----
Basic `.github/workflows/ci.yml` [reusable workflow] to run [`scripts`].[`test`]s:
~~~ yaml
name: CI
on:
  workflow_dispatch:
  push:
    branches: [main]

jobs:
  CI:
    uses: danielbayley/npm-package-ci/.github/workflows/ci.yml@v1
    #with:
      #node-version: 21, 22
~~~

> [!NOTE]
> Optionally specify `with.node-version`, or version*s* in [CSV] format.
> [Node] versions `20`–`latest` will be tested by default.

> [!WARNING]
> [`corepack`] requires a [lockfile] to operate.

License
-------
[MIT] © [Daniel Bayley]

[MIT]:                LICENSE.md
[Daniel Bayley]:      https://github.com/danielbayley

[node]:               https://nodejs.org/en/about/previous-releases#looking-for-latest-release-of-a-version-branch
[`corepack`]:         https://nodejs.org/api/corepack.html

[lockfile]:           https://pnpm.io/git#lockfiles
[`p`]:                https://pnpm.io
[`npm`]:              https://npmjs.com
[package]:            https://docs.npmjs.com/about-packages-and-modules
[`scripts`]:          https://docs.npmjs.com/cli/using-npm/scripts
[`test`]:             https://docs.npmjs.com/cli/using-npm/scripts#npm-test
[`publish`]:          https://docs.npmjs.com/cli/commands/npm-publish

[ci]:                 https://docs.github.com/actions/automating-builds-and-tests/about-continuous-integration
[action]:             https://github.com/features/actions
[reusable workflow]:  https://docs.github.com/actions/using-workflows/reusing-workflows

[csv]:                https://wikipedia.org/wiki/Comma-separated_values
