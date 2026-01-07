import assert from 'node:assert/strict'
import getDependencies from '../index.js'

/**
@import {PackageJson} from '../index.js'
*/

/**
@param {PackageJson} packageJson
@param {Set<PackageJson>} seen
@returns {Generator<PackageJson>}
*/
function* collectDependencies(packageJson, seen = new Set()) {
  yield packageJson
  for (const type of ['dependencies', 'devDependencies', 'peerDependencies']) {
    for (const dependency of packageJson[type].values()) {
      const {resolved} = dependency
      if (type !== 'peerDependencies' && type !== 'devDependencies') {
        assert.ok(
          resolved,
          `Unable to resolve ${dependency.type} '${dependency.name}@${dependency.version}' from '${dependency.base}'.`,
        )
      }

      if (resolved && !seen.has(resolved)) {
        seen.add(resolved)
        yield* collectDependencies(resolved, seen)
      }
    }
  }
}

const dependencies = collectDependencies(getDependencies())
  .map(({name, version}) => ({name, version}))
  .toArray()
  .toSorted(({name: nameA}, {name: nameB}) => nameA.localeCompare(nameB))
console.table(dependencies)
