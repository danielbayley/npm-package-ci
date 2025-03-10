<img title="Check" alt="Check" src="logo.svg" align="right" width="64vw">

[_Node_.js] [`--test`] GitHub [Reporter]
========================================
Informative `node` test [reporter] for GitHub [Action]s.

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
    <img title="fail" src="octicons/x-circle-fill-16.svg"/>&ensp;suite
  </summary>
  <blockquote>
    <span>
      <img title="pass" src="octicons/check-circle-fill-16.svg"/>&ensp;pass
    </span>
    <br>
    <span>
      <img title="fail" src="octicons/x-circle-fill-16.svg"/>&ensp;fail
    </span>
    <br>
    <span>
      <img title="fail" src="octicons/skip-16.svg"/>&ensp;skip
    </span>
    <br>
    <span>
      <img title="fail" src="octicons/alert-16.svg"/>&ensp;todo
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
A `test` [report][reporter] similar to the above will be
automatically generated by the _[npm Package CI]_ GitHub [action].  
See basic example `.github/workflows/ci.yaml`
[reusable workflow] to run [`scripts`].[`test`]s:
~~~ yaml
name: CI
on:
  push:
    branches: [main]

jobs:
  CI:
    uses: danielbayley/npm-package-ci/.github/workflows/ci.yaml@v1
~~~
~~~ jsonc
// package.json
"scripts": {
  "test": "node --test tests/*.js" // --experimental-test-coverage"
}
~~~

## Install
~~~ sh
pnpm install node-test-reporter-github --save-dev
~~~
> [!IMPORTANT]
> This package is _[ESM]_ [only], so must be [`import`]ed instead of [`require`]d,
> and [depends] on [_Node_.js] [`>=`][][`20`].

Specify this requirement with [`devEngines`]:
~~~ jsonc
// package.json
"type": "module",
"devEngines": {
  "runtime": {
    "name": "node",
    "version": ">=20"
  }
},
~~~

Fully [tested], with high [coverage][tested].

License
-------
[MIT] © [Daniel Bayley]

[MIT]:                ../LICENSE.md
[Daniel Bayley]:      https://github.com/danielbayley

[tested]:             https://github.com/danielbayley/npm-package-ci/actions

[`--test`]:           https://nodejs.org/api/test.html#running-tests-from-the-command-line
[reporter]:           https://nodejs.org/api/test.html#test-reporters

[_Node_.js]:          https://nodejs.org
[ESM]:                https://developer.mozilla.org/docs/Web/JavaScript/Guide/Modules
[only]:               https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c
[`import`]:           https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/import
[`require`]:          https://nodejs.org/api/modules.html#requireid
[depends]:            https://docs.npmjs.com/cli/v11/configuring-npm/package-json#engines
[`>=`]:               https://docs.npmjs.com/cli/v6/using-npm/semver#ranges
[`20`]:               https://github.com/nodejs/node/blob/main/doc/changelogs/CHANGELOG_V20.md
[`devEngines`]:       https://docs.npmjs.com/cli/v11/configuring-npm/package-json#devengines

[`scripts`]:          https://docs.npmjs.com/cli/using-npm/scripts
[`test`]:             https://docs.npmjs.com/cli/using-npm/scripts#npm-test

[npm Package CI]:     ..#readme
[action]:             https://github.com/features/actions
[reusable workflow]:  https://docs.github.com/actions/using-workflows/reusing-workflows

[csv]:                https://wikipedia.org/wiki/Comma-separated_values
