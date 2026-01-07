import { findPackageJSON } from "node:module";
import fs from "node:fs";
import process from "node:process";
import path from "node:path";
import url from "node:url";
import { inspect } from "node:util";

const VALUE_UNINITIALIZED = Symbol("VALUE_UNINITIALIZED");
const DEPENDENCY_TYPES = [
  "dependencies",
  "devDependencies",
  "peerDependencies",
];

// https://github.com/tc39/proposal-upsert
const mapGetOrInsertComputed = (map, value, function_) =>
  (map.has(value) ? map : map.set(value, function_(value))).get(value);
const memorized = (function_) => (value) =>
  mapGetOrInsertComputed(new Map(), value, function_);
const loadPackageJson = memorized((packageJsonFile) =>
  JSON.parse(fs.readFileSync(packageJsonFile)),
);

const defineEnumerableGetters = (object, constructor) => {
  const descriptors = Object.getOwnPropertyDescriptors(constructor.prototype);
  for (const [property, descriptor] of Object.entries(descriptors)) {
    if (
      descriptor.enumerable === false &&
      typeof descriptor.get === "function"
    ) {
      Object.defineProperty(object, property, {
        ...descriptor,
        enumerable: true,
      });
    }
  }
};

class EnumerableGetters {
  constructor() {
    defineEnumerableGetters(this, new.target);
  }
}

class PackageJson extends EnumerableGetters {
  static #instanceCache = new Map();

  file;
  #packageJsonFile;
  #dependenciesCache = new Map();

  constructor(packageJsonFile) {
    return mapGetOrInsertComputed(
      PackageJson.#instanceCache,
      packageJsonFile,
      () => {
        super();
        this.file = packageJsonFile;
        this.#packageJsonFile = packageJsonFile;

        for (const type of DEPENDENCY_TYPES) {
          Object.defineProperty(this, type, {enumerable: true,
            get: () => this.#getDependencies(type),
          });
        }

        return this;
      },
    );
  }

  get name() {
    return this.#packageJsonData.name;
  }

  get version() {
    return this.#packageJsonData.version;
  }

  get data() {
    return this.#packageJsonData
  }

  get #packageJsonData() {
    return loadPackageJson(this.#packageJsonFile);
  }

  #getDependencies(type) {
    return mapGetOrInsertComputed(this.#dependenciesCache, type, () => {
      const packageJsonData = this.#packageJsonData;
      const dependencies = packageJsonData[type] ?? {};

      return new Map(
        Object.entries(dependencies).map(([name, version]) => [
          name,
          new Dependency({
            name,
            version,
            type,
            base: this.#packageJsonFile,
          }),
        ]),
      );
    });
  }
}

class Dependency  extends EnumerableGetters {
  #packageJsonFileCache = VALUE_UNINITIALIZED;
  name;
  version;
  base;
  type;

  constructor({ type, name, version, base }) {
    super()
    this.type = type;
    this.name = name;
    this.version = version;
    this.base = base;
  }

  get #packageJsonFile() {
    if (this.#packageJsonFileCache === VALUE_UNINITIALIZED) {
      const {name, base} = this;
      let packageJsonFile;
      try {
        packageJsonFile = findPackageJSON(name, base);
      } catch (error) {
        if (error?.code !== "ERR_MODULE_NOT_FOUND") {
          throw error;
        }
      }

      this.#packageJsonFileCache = packageJsonFile;
    }
    return this.#packageJsonFileCache;
  }

  get file() {
    return this.#packageJsonFile;
  }

  get resolved() {
    const packageJsonFile = this.#packageJsonFile;
    if (!packageJsonFile) {
      return;
    }

    return new PackageJson(packageJsonFile);
  }
}

function getPackageDependencies(packageJsonFile = process.cwd()) {
  if (packageJsonFile instanceof URL) {
    packageJsonFile = url.fileURLToPath(packageJsonFile)
  }

  if (!path.isAbsolute(packageJsonFile)) {
    throw new Error(`Expected 'packageJsonFile' to an URL or absolute path to package.json file or it's directory.`)
  }

  if (path.basename(packageJsonFile) !== 'package.json') {
    packageJsonFile = path.join(packageJsonFile, 'package.json')
  }

  loadPackageJson(packageJsonFile)
  return new PackageJson(packageJsonFile)
}

export {getPackageDependencies}

