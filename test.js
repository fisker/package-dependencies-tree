import assert from 'node:assert/strict'
import path from 'node:path'
import test from 'node:test'
import url from 'node:url'
import spawn from 'nano-spawn'
import getPackageDependencies from './index.js'
import packageJson from './package.json' with {type: 'json'}

test('Main', () => {
  const dependencies = getPackageDependencies()

  for (const packageJsonFile of [
    import.meta.dirname,
    path.join(import.meta.dirname, 'package.json'),
    new URL('./package.json', import.meta.url),
    new URL('./', import.meta.url),
  ]) {
    assert.equal(getPackageDependencies(packageJsonFile), dependencies)
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
})

test('Fixtures', async () => {
  const fixtures = new URL('./fixtures/', import.meta.url)

  await spawn('yarn', ['--immutable'], {
    cwd: fixtures,
    env: {YARN_ENABLE_IMMUTABLE_INSTALLS: 'true'},
  })
  const fixturesPackage = getPackageDependencies(fixtures)
  const {file: fixturesPackageJsonFile} = fixturesPackage

  {
    const jsrDependency = fixturesPackage.dependencies.get('@std/path')
    assert.equal(jsrDependency.name, '@std/path')
    assert.equal(jsrDependency.version, 'jsr:1.1.4')
    assert.equal(jsrDependency.base, fixturesPackageJsonFile)
    assert.equal(jsrDependency.type, 'dependencies')
    assert.equal(
      jsrDependency.file,
      url.fileURLToPath(
        new URL('./node_modules/@std/path/package.json', fixtures),
      ),
    )
    assert.equal(jsrDependency.resolved.name, '@jsr/std__path')
    assert.equal(jsrDependency.resolved.version, '1.1.4')

    const deepDependency =
      jsrDependency.resolved.dependencies.get('@jsr/std__internal')
    assert.ok(deepDependency)
    assert.equal(deepDependency.base, jsrDependency.file)
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
    assert.equal(
      localDependency.resolved.name,
      '@package-dependencies-tree/local-package',
    )
    assert.equal(localDependency.resolved.version, '1.0.0')

    const deepDependency =
      localDependency.resolved.peerDependencies.get('@std/path')
    assert.equal(deepDependency.name, '@std/path')
    assert.equal(deepDependency.version, '*')
    assert.equal(deepDependency.type, 'peerDependencies')
    assert.equal(
      deepDependency.resolved,
      fixturesPackage.dependencies.get('@std/path').resolved,
    )
  }
})
