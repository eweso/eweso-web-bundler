# Eweso Web Bundler

This library provides everything to compile `TypeScript` source code to JS, including assets like CSS, images, fonts, etc. and `Sass` source code to an optimized CSS file. The web bundler is based on `webpack` with `esbuild` for a fast `TypeScript` compilation. It also uses `CSSO` to optimize the generated CSS assets. To simplefy the usage there are the two compile commands `compile-sass` and `compile-ts`. They will be introduced later.

## Installation

Navigate to the application root directory of your project where your main `package.json` is located and execute following command. Only this way ensures that dependencies like `typescript` and `webpack` are installed.

```sh
npm install --ignore-scripts -D github:eweso/eweso-web-bundler
```

## Base Configuration

### TypeScript

Create a `tsconfig.json` file in your application root directory (where your `package.json` is already located) and insert following content ot the `tsconfig.json` file. The `typeRoots` option is only relevant for Eweso projects where custom type files are used for pure JS libraries without types. You can include any other `@types` directory or omit it. 

```json
{
  "extends": "./node_modules/@eweso/build/tsconfig.json",
  "compilerOptions": {
    "paths": {
      "*": [
        "./node_modules/*"
      ]
    },
    "typeRoots": [
      "./node_modules/@eweso/types"
    ]
  }
}
```

### Webpack

Now create a `webpack.config.js` in the application root directory and insert this content:

```Node
module.exports = require('./node_modules/@eweso/build/webpack.config.js');
```

## Usage Configuration

The `Typescript` and `webpack` configurations are just the base configuration. There are now two ways to prepare the actual source rendering. You can use the `eweso-web-bundler` in a monorepo with several independent modules or your can extend the "root" config files. A typical project directory looks like this:

```txt
Root:/modules/module-a/
---
/scss/main.scss
/ts/main.ts
/tsconfig.json
/webpack.config.js
```

And your module `tsconfig.json` file looks like this:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "tsBuildInfoFile": ".tsbuildinfo",
    "incremental": true,
    "types": [
      "clipboard",
      "eweso"
    ]
  },
  "include": [
    "ts/**/*"
  ]
}
```

And your `webpack.config.js` file:

```js
// noinspection JSCheckFunctionSignatures,NpmUsedModulesInstalled

const path = require('path');
const {merge} = require('webpack-merge');
const common = require('../../webpack.config');

module.exports = merge(common, {
    entry: {
        "main": "./ts/main.ts"
    },
    output: {
        publicPath: 'public',
        path: path.resolve(__dirname, 'public')
    },
});
```

As you can see, the `TypeScript` and the `webpack` configurations extend the base config and only add the used types and the location for the source and destination. When you have multiple independent modules, then you **must** also create a `package.json` file that only needs the `name` field to ensure that those bundles use a distinct webpack bundle ID so that they can be used independently.

## Compilation

### TypeScript to JavaScript

When the configuration is done, you can now navigate to the module root directory, for example `/modules/module-a/` and execute following command to compile `TypeScript` to JS and including all assets, like CSS.

```bash
npx compile-ts
```

This command doesn't accept arguments, because it uses your `tsconfig.json`, `package.json` and `webpack.config.js` file to find the `TypeScript` source and to output the compiled JS with its assets to the `public` directory. It first uses `tsgo` to validate the `TypeScript` source and then `webpack's esbuild` to compile `TypeScript` to JS. In this process, all JS and TS source from package in `node_modules` or `libraries` folder are move to the `vendor.min.js`. All CSS from this folders is bundled to a `vendor.min.css`. Assets like images or fonts are stored in `assets/{asset-name}`.

Since it uses tsgo to check and esbuild to compile, the source code is generated extremely fast. A project with more than 250.000 lines of code using approx 20 node modules is compiled in 1.5 seconds. Typical modules are compiled between 80 and 400 ms on a MacBook Pro M-series.

### Sass to CSS

This command is different from `npx compile-ts`, because it requires to arguments. The first one is the source Sass file and the second argument is the output file. This command first compile the Sass file to CSS and then uses CSSO to optimize the output, for example by grouping media queries and CSS selectors, when the declaration block is equal.

```bash
npx compile-sass scss/main.scss public/main.css
```

### Automation

You can use tools like `fswatch` to watch for TypeScript or Sass changes to compile immediately after saving changes to the disk. When you use an IDE like `Intellij` you can edit several files and trigger disk changes at once to execute the compilation only one time.

An automation can look like this:

```bash
#!/usr/bin/env bash
set -o pipefail
set -o nounset

_do_watch() {
  local _watch_path _command _batch_marker _relative_path
  _watch_path="${1}"
  _command="${2}"
  _batch_marker="${_command} Execute"
  _relative_path="${_watch_path//\/opt\/project\//}"

  echo "- ${_relative_path}"
  fswatch --recursive --event-flags --batch-marker="${_batch_marker}" \
    --event Updated --event Created --event Removed \
    --monitor=poll_monitor \
    "${_watch_path}" | while read -r _line; do
    echo "${_line}"
    if [[ "${_line}" == "${_batch_marker}" ]]; then
      echo ""
      "${_command}"
      echo ""
    fi
  done
}

echo "Watching:"
for _dir in "/opt/project/modules"/*/*; do
  _build_js_bin="${_dir}/build/build-js.sh"
  _build_css_bin="${_dir}/build/build-css.sh"

  if [[ -e "${_build_js_bin}" ]]; then
    chmod +x "${_build_js_bin}"
    _do_watch "${_dir}/ts" "${_build_js_bin}" &
  fi

  if [[ -e "${_build_css_bin}" ]]; then
    chmod +x "${_build_css_bin}"
    _do_watch "${_dir}/scss" "${_build_css_bin}" &
  fi
done

echo ""
wait -n
```

In this project every module with `TypeScript` source has a `build/build-js.sh` file and every module with `Sass` source a `build/build-css.sh`. But this is just an example. There are several ways to automate watching for changes in the `/ts` folder to execute `npx compile-ts` in the module root directory.
