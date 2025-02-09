<img title="Check" alt="Check" src="node-test-reporter-github/logo.svg" align="right" width="64vw">

[`npm`] Package [CI]
====================
Simple CI GitHub [Action] for your [[`p`]]`npm`/[`yarn`] [package]s.

Preview
-------
Test Results
------------------------------------------------------------------------
| Tests | Suites | Pass | Fail | Cancelled | Skipped | Todo | Duration |
|:------|:-------|:-----|:-----|:----------|:--------|:-----|:---------|
| 4     | 1      | 1    | 1    | 0         | 1       | 1    | 500ms    |

### Details
<details open>
  <summary>
    <img title="fail" src="node-test-reporter-github/octicons/x-circle-fill-16.svg"/>&ensp;suite
  </summary>
  <blockquote>
    <span>
      <img title="pass" src="node-test-reporter-github/octicons/check-circle-fill-16.svg"/>&ensp;pass
    </span>
    <br>
    <span>
      <img title="fail" src="node-test-reporter-github/octicons/x-circle-fill-16.svg"/>&ensp;fail
    </span>
    <br>
    <span>
      <img title="fail" src="node-test-reporter-github/octicons/skip-16.svg"/>&ensp;skip
    </span>
    <br>
    <span>
      <img title="fail" src="node-test-reporter-github/octicons/alert-16.svg"/>&ensp;todo
    </span>
    <br>
  </blockquote>
</details>

### Coverage
| File          | Line (%) | Branch (%) | Functions (%) | Uncovered lines |
|:--------------|:---------|:-----------|:--------------|:----------------|
| tests/unit.js | 100.00   | 100.00     | 100.00        | 1-2 4-5         |
| All files     | 100.00   | 100.00     | 100.00        |                 |

Usage
-----
Basic `.github/workflows/ci.yaml` [reusable workflow] to run [`scripts`].[`test`]s:
~~~ yaml
name: CI
on:
  push:
    branches: [main]

jobs:
  CI:
    uses: danielbayley/npm-package-ci/.github/workflows/ci.yaml@v1
    #with:
      #node-version: 21, 22
~~~

> [!NOTE]
> Optionally specify `with.node-version`, or version*s* in [CSV] format.  
> [_Node_.js] versions [`20`]–[`latest`] will be `test`ed against by default.

> [!WARNING]
> [`corepack`] requires a [lockfile] to operate.

License
-------
[MIT] © [Daniel Bayley]

[MIT]:                LICENSE.md
[Daniel Bayley]:      https://github.com/danielbayley

[_Node_.js]:          https://nodejs.org/about/previous-releases#looking-for-latest-release-of-a-version-branch
[`20`]:               https://github.com/nodejs/node/blob/main/doc/changelogs/CHANGELOG_V20.md
[`latest`]:           https://github.com/actions/setup-node#supported-version-syntax
[`corepack`]:         https://nodejs.org/api/corepack.html

[lockfile]:           https://pnpm.io/git#lockfiles
[`p`]:                https://pnpm.io
[`npm`]:              https://npmjs.com
[`yarn`]:             https://yarnpkg.com
[package]:            https://docs.npmjs.com/about-packages-and-modules
[`scripts`]:          https://docs.npmjs.com/cli/using-npm/scripts
[`test`]:             https://docs.npmjs.com/cli/commands/npm-test
[`publish`]:          https://docs.npmjs.com/cli/commands/npm-publish

[ci]:                 https://docs.github.com/actions/automating-builds-and-tests/about-continuous-integration
[action]:             https://github.com/features/actions
[reusable workflow]:  https://docs.github.com/actions/using-workflows/reusing-workflows

[csv]:                https://wikipedia.org/wiki/Comma-separated_values
