# Eweso web bundler

This library provides a TypesSript base config, webpack base config and a sass compiler with inbuild css optimization. This is the foundation for eweso web UI development.

## Installation

Run this command in the directory where your main `package.json` is located.

```sh
npm i -D github:eweso/eweso-web-bundler
```

Adding `github:eweso/eweso-web-bundler` only to the `package.json` won't install the dependencies!

## Usage

### TypeScript

Create a `tsconfig.json` in the application root where the `package.json` and `node_modules` folder are located and add this to the file for the barebone configuration. 

```json
{
  "extends": "./node_modules/@eweso/build/tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "*": [
        "node_modules/*"
      ]
    }
  }
}
```

### Webpack

Create a `webpack.config.js` in the application root, where your `tsconfig.json` and the `package.json` is located and add this to the file:

```Node
module.exports = require('./node_modules/@eweso/build/webpack.config.js');
```
