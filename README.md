[`npm`] Package [CI]
====================
Easy GitHub [Action] CI for your `npm` [package]s.

Usage
-----
Basic `.github/workflows/ci.yml` [reusable workflow]:
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
      #node-version: 20, 21, 22
~~~

> [!NOTE]
> Optionally specify `with.node-version`, or [Node] versions in [CSV] format.

License
-------
[MIT] © [Daniel Bayley]

[MIT]:                LICENSE.md
[Daniel Bayley]:      https://github.com/danielbayley

[node]:               https://nodejs.org/en/about/previous-releases#looking-for-latest-release-of-a-version-branch
[`npm`]:              https://npmjs.com
[package]:            https://docs.npmjs.com/about-packages-and-modules
[ci]:                 https://docs.github.com/actions/automating-builds-and-tests/about-continuous-integration
[action]:             https://docs.github.com/actions
[reusable workflow]:  https://docs.github.com/actions/using-workflows/reusing-workflows

[csv]:                https://wikipedia.org/wiki/Comma-separated_values
