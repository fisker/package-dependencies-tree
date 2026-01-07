# package-dependencies-tree

[![Npm Version][package_version_badge]][package_link]
[![MIT License][license_badge]][license_link]
[![Coverage][coverage_badge]][coverage_link]

[coverage_badge]: https://img.shields.io/codecov/c/github/fisker/package-dependencies-tree.svg?style=flat-square
[coverage_link]: https://app.codecov.io/gh/fisker/package-dependencies-tree
[license_badge]: https://img.shields.io/npm/l/package-dependencies-tree.svg?style=flat-square
[license_link]: https://github.com/fisker/package-dependencies-tree/blob/main/license
[package_version_badge]: https://img.shields.io/npm/v/package-dependencies-tree.svg?style=flat-square
[package_link]: https://www.npmjs.com/package/package-dependencies-tree

> Get package dependencies tree.

## Install

```bash
yarn add package-dependencies-tree
```

## Usage

```js
import getDependencies from 'package-dependencies-tree'

console.log(
  getDependencies()
    .devDependencies.get('@fisker/eslint-config')
    .resolved.dependencies.values()
    .map(({resolved: {name, version}}) => `${name}@${version}`)
    .take(10)
    .toArray()
    .toSorted(),
)
/* ->
[
  '@babel/core@7.28.5',
  '@babel/eslint-parser@7.28.5',
  '@eslint-community/eslint-plugin-eslint-comments@4.5.0',
  '@eslint/js@9.39.2',
  '@stylistic/eslint-plugin@5.6.1',
  'eslint-config-prettier@10.1.8',
  'eslint-plugin-es-x@9.3.0',
  'eslint-plugin-n@17.23.1',
  'eslint-plugin-promise@7.2.1',
  'eslint-plugin-regexp@2.10.0',
]
*/
```

[Example for collect all dependencies](./examples/collect-dependencies.js)

## API

### `getDependencies(packageJsonFile?: string | URL)`

#### `packageJsonFile`

Type: `string | URL`

URL or absolute path to package.json file or it's directory.

```js
// Default to `path.join(process.cwd(), 'package.json')`
getDependencies()

// Directory
getDependencies(import.meta.dirname)

// Path to `package.json` file
getDependencies(path.join(import.meta.dirname, 'package.json'))

// URL to directory
getDependencies(new URL('../', import.meta.url))

// URL to `package.json` file
getDependencies(new URL('../package.json', import.meta.url))
```