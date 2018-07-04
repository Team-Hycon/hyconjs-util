# Hycon javascript utilities
Common javascript functions for Hycon.

## Examples

```js
import * as utils from "@glosfer/hyconjs-util";

const result = utils.addressToUint8Array("H497fHm8gbPZxaXySKpV17a7beYBF9Ut3");
console.log(result);
```

### Install dependencies

```bash
npm install
```

### Build

```bash
npm run-script build
```

### Deploy

Checklist before deploying a new release:

* you have the right in the glosfer org on NPM
* you have run `npm login` once (check `npm whoami`)
* Go to **master** branch
  * your master point on glosfer repository (check with `git config remote.$(git config branch.master.remote).url` and fix it with `git branch --set-upstream master origin/master`)
  * you are in sync (`git pull`) and there is no changes in `git status`
* Run `npm intall` once, there is still no changes in `git status`

**deploy a new release**

```
 npm install
 npm run-script build
 npm publish
```

then, go to [/releases](https://github.com/arigatodl/hyconjs-util/releases) and create a release with change logs.

## Issues & Pull Requests

If you have an issue, feel free to add it to the [Issues](https://github.com/arigatodl/hyconjs-util/issues) tab.
If you'd like to help us out, the [Pull Request](https://github.com/arigatodl/hyconjs-util/pulls) tab is a great place to start.

**If you have found a security bug, please contact us at [security@glosfer.com](security@glosfer.com).**

## Authors

* **Dulguun Batmunkh** - *Initial work* <dulguun@glosfer.com>
