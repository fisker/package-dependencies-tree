import fs from 'node:fs'
import {findPackageJSON} from 'node:module'
import path from 'node:path'
import process from 'node:process'
import url from 'node:url'

/**
@import {PackageJson as PackageJsonData} from 'type-fest';
@typedef {'dependencies' | 'devDependencies' | 'peerDependencies'} DependencyTypes
@typedef {DependencyImplementation} Dependency
@typedef {PackageJsonImplementation} PackageJson
*/

const VALUE_UNINITIALIZED = Symbol('VALUE_UNINITIALIZED')

// https://github.com/tc39/proposal-upsert
/**
@template {any} InputValue
@template {(value: InputValue) => any} InputFunction
@param {Map<InputValue, ReturnType<InputFunction>>} map
@param {InputValue} value
@param {InputFunction} function_
@returns {ReturnType<InputFunction>}
*/
const mapGetOrInsertComputed = (map, value, function_) =>
  (map.has(value) ? map : map.set(value, function_(value))).get(value)
/**
@template {(value: any) => any} InputFunction
@param {InputFunction} function_
*/
const memorized = (function_) => (value) =>
  mapGetOrInsertComputed(new Map(), value, function_)
const loadPackageJson = memorized(
  /**
  @param {string} packageJsonFile
  @returns {PackageJsonData}
  */
  (packageJsonFile) =>
    // eslint-disable-next-line unicorn/prefer-json-parse-buffer
    JSON.parse(fs.readFileSync(packageJsonFile, 'utf8')),
)

/**
@param {EnumerableGetters} object
@param {(PackageJsonImplementation | DependencyImplementation)['constructor']} constructor
*/
const defineEnumerableGetters = (object, constructor) => {
  const descriptors = Object.getOwnPropertyDescriptors(constructor.prototype)
  for (const [property, descriptor] of Object.entries(descriptors)) {
    if (
      descriptor.enumerable === false &&
      typeof descriptor.get === 'function'
    ) {
      Object.defineProperty(object, property, {
        ...descriptor,
        enumerable: true,
      })
    }
  }
}

class EnumerableGetters {
  constructor() {
    defineEnumerableGetters(this, new.target)
  }
}

class PackageJsonImplementation extends EnumerableGetters {
  // eslint-disable-next-line sonarjs/public-static-readonly
  static #instanceCache =
    /** @type {Map<string, PackageJsonImplementation>} */ (new Map())

  /**
  @param {string} packageJsonFile
  */
  static create(packageJsonFile) {
    const instanceCache = PackageJsonImplementation.#instanceCache
    return mapGetOrInsertComputed(
      instanceCache,
      packageJsonFile,
      () => new PackageJsonImplementation(packageJsonFile),
    )
  }

  file
  #packageJsonFile
  #dependenciesCache = new Map()

  /**
  @internal
  @param {string} packageJsonFile
  */
  constructor(packageJsonFile) {
    super()
    this.file = packageJsonFile
    this.#packageJsonFile = packageJsonFile
  }

  get name() {
    return this.#packageJsonData.name
  }

  get version() {
    return this.#packageJsonData.version
  }

  get data() {
    return this.#packageJsonData
  }

  get #packageJsonData() {
    return loadPackageJson(this.#packageJsonFile)
  }

  get dependencies() {
    return this.#getDependencies('dependencies')
  }

  get devDependencies() {
    return this.#getDependencies('devDependencies')
  }

  get peerDependencies() {
    return this.#getDependencies('peerDependencies')
  }
  /**
  @param {DependencyTypes} type
  */
  #getDependencies(type) {
    return mapGetOrInsertComputed(this.#dependenciesCache, type, () => {
      const packageJsonData = this.#packageJsonData
      const dependencies = packageJsonData[type] ?? {}

      return new Map(
        Object.entries(dependencies).map(([name, version]) => [
          name,
          new DependencyImplementation({
            name,
            version,
            type,
            base: this.#packageJsonFile,
          }),
        ]),
      )
    })
  }
}

class DependencyImplementation extends EnumerableGetters {
  /** @type {typeof VALUE_UNINITIALIZED | string | undefined} */
  #packageJsonFileCache = VALUE_UNINITIALIZED
  name
  version
  base
  type

  /**
  @param {{
    type: DependencyTypes,
    name: string,
    version: string,
    base: string,
  }} param0
  */
  constructor({type, name, version, base}) {
    super()
    this.type = type
    this.name = name
    this.version = version
    this.base = base
  }

  get #packageJsonFile() {
    if (this.#packageJsonFileCache === VALUE_UNINITIALIZED) {
      const {name, base} = this
      let packageJsonFile
      try {
        packageJsonFile = findPackageJSON(name, base)
      } catch (error) {
        if (error?.code !== 'ERR_MODULE_NOT_FOUND') {
          throw error
        }
      }

      this.#packageJsonFileCache = packageJsonFile
    }
    return this.#packageJsonFileCache
  }

  get file() {
    return this.#packageJsonFile
  }

  get resolved() {
    const packageJsonFile = this.#packageJsonFile
    if (!packageJsonFile) {
      // eslint-disable-next-line getter-return
      return
    }

    return PackageJsonImplementation.create(packageJsonFile)
  }
}

/**
@param {string | URL} [packageJsonFile]
@returns {PackageJson}
*/
function getPackageDependencies(packageJsonFile = process.cwd()) {
  if (packageJsonFile instanceof URL) {
    packageJsonFile = url.fileURLToPath(packageJsonFile)
  }

  if (!path.isAbsolute(packageJsonFile)) {
    throw new Error(
      "Expected 'packageJsonFile' to an URL or absolute path to package.json file or it's directory.",
    )
  }

  if (path.basename(packageJsonFile) !== 'package.json') {
    packageJsonFile = path.join(packageJsonFile, 'package.json')
  }

  loadPackageJson(packageJsonFile)
  return PackageJsonImplementation.create(packageJsonFile)
}

export default getPackageDependencies
