<img alt="Check" src="octicons/check-circle-fill-16.svg" align="right" width="64vw">

_[Node.js]_ [`--test`] GitHub [Reporter]
========================================
Informative `node` test [reporter] for GitHub [Actions].

## Usage
~~~ sh
node --test-reporter node-test-reporter-github --test tests/*.js
~~~
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
> [Node][node.js] versions `20`–`latest` will be tested by default.

> [!WARNING]
> [`corepack`] requires a [lockfile] to operate.

## Install
~~~ sh
[p]npm install node-test-reporter-github --save-dev
~~~

License
-------
[MIT] © [Daniel Bayley]

[MIT]:                LICENSE.md
[Daniel Bayley]:      https://github.com/danielbayley

[node.js]:            https://nodejs.org
[`--test`]:           https://nodejs.org/api/test.html#running-tests-from-the-command-line
[reporter]:           https://nodejs.org/api/test.html#test-reporters
[`corepack`]:         https://nodejs.org/api/corepack.html

[lockfile]:           https://pnpm.io/git#lockfiles
[`scripts`]:          https://docs.npmjs.com/cli/using-npm/scripts
[`test`]:             https://docs.npmjs.com/cli/using-npm/scripts#npm-test

[actions]:            https://github.com/features/actions
[reusable workflow]:  https://docs.github.com/actions/using-workflows/reusing-workflows

[csv]:                https://wikipedia.org/wiki/Comma-separated_values
