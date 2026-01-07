import assert from 'node:assert/strict'
import path from 'node:path'
import test from 'node:test'
import url from 'node:url'
import spawn from 'nano-spawn'
import getDependencies from './index.js'
import packageJson from './package.json' with {type: 'json'}

test('Main', () => {
  const dependencies = getDependencies()

  for (const packageJsonFile of [
    import.meta.dirname,
    path.join(import.meta.dirname, 'package.json'),
    new URL('./package.json', import.meta.url),
    new URL('./', import.meta.url),
  ]) {
    assert.equal(getDependencies(packageJsonFile), dependencies)
  }

  assert.deepEqual(dependencies.data, packageJson)
  assert.equal(
    dependencies.peerDependencies.size,
    Object.keys(packageJson.peerDependencies ?? {}).length,
  )
  assert.equal(
    dependencies.devDependencies.size,
    Object.keys(packageJson.devDependencies ?? {}).length,
  )

  assert.throws(() => getDependencies('./a-relative-path'))
})

test('Fixtures', async () => {
  const fixtures = new URL('./fixtures/', import.meta.url)

  await spawn('yarn', ['--immutable'], {cwd: fixtures, stdio: 'inherit'})
  const fixturesPackage = getDependencies(fixtures)
  const {file: fixturesPackageJsonFile} = fixturesPackage

  {
    const dependency = fixturesPackage.dependencies.get('search-closest')
    assert.equal(dependency.name, 'search-closest')
    assert.equal(dependency.version, '<=1.1.0')
    assert.equal(dependency.base, fixturesPackageJsonFile)
    assert.equal(dependency.type, 'dependencies')

    assert.equal(
      dependency.resolved.file,
      url.fileURLToPath(
        new URL('./node_modules/search-closest/package.json', fixtures),
      ),
    )
    assert.equal(dependency.resolved.name, 'search-closest')
    assert.equal(dependency.resolved.version, '1.1.0')

    const deepDependency =
      dependency.resolved.dependencies.get('find-in-directory')
    assert.ok(deepDependency)
    assert.equal(deepDependency.base, dependency.resolved.file)
  }

  {
    const renamedDependency = fixturesPackage.devDependencies.get(
      'renamed-deno-path-from-file-url',
    )
    assert.equal(renamedDependency.name, 'renamed-deno-path-from-file-url')
    assert.equal(renamedDependency.version, 'npm:deno-path-from-file-url@0.0.6')
    assert.equal(renamedDependency.type, 'devDependencies')
    assert.equal(renamedDependency.resolved.name, 'deno-path-from-file-url')
    assert.equal(renamedDependency.resolved.version, '0.0.6')
  }

  {
    const localDependency = fixturesPackage.dependencies.get('local-package')
    assert.equal(localDependency.name, 'local-package')
    assert.equal(localDependency.version, 'file:./local-package')
    assert.equal(localDependency.type, 'dependencies')
    assert.equal(
      localDependency.resolved.name,
      '@package-dependencies-tree/local-package',
    )
    assert.equal(localDependency.resolved.version, '1.0.0')

    const deepDependency =
      localDependency.resolved.peerDependencies.get('search-closest')
    assert.equal(deepDependency.name, 'search-closest')
    assert.equal(deepDependency.version, '*')
    assert.equal(deepDependency.type, 'peerDependencies')
    assert.equal(
      deepDependency.resolved,
      fixturesPackage.dependencies.get('search-closest').resolved,
    )
  }

  {
    const nonExistsDependency = fixturesPackage.dependencies.get(
      'non-exists-dependency',
    )
    assert.equal(nonExistsDependency, undefined)
  }

  {
    const nonInstalledDependency = fixturesPackage.peerDependencies.get(
      '@package-dependencies-tree/package-wont-install',
    )
    assert.equal(
      nonInstalledDependency.name,
      '@package-dependencies-tree/package-wont-install',
    )
    assert.equal(nonInstalledDependency.version, '1.0.0')
    assert.equal(nonInstalledDependency.resolved, undefined)
  }
})
