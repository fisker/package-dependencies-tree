export default getDependencies;
export type JsonPrimitive = string | number | boolean | null;
export type JsonArray = JsonValue[];
export type JsonObject = { [Key in string]: JsonValue; };
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export type PackageJsonData = {
    name: string;
    version: string;
} & JsonObject;
export type DependencyTypes = "dependencies" | "devDependencies" | "peerDependencies";
export type Dependency = DependencyImplementation;
export type PackageJson = PackageJsonImplementation;
/**
Get dependencies from package.json file.

@param {string | URL} [packageJsonFile] - URL or absolute path to package.json file or it's directory.
@returns {PackageJson}

@example
```js
import getDependencies from 'package-dependencies-tree'

console.log(getDependencies().dependencies.size)
// 10
```
*/
declare function getDependencies(packageJsonFile?: string | URL): PackageJson;
/**
@template {DependencyTypes} [DependencyType = DependencyTypes]
*/
declare class DependencyImplementation<DependencyType extends DependencyTypes = DependencyTypes> extends EnumerableGetters {
    /**
    @param {{
      type: DependencyType,
      name: string,
      version: string,
      base: string,
    }} param0
    */
    constructor({ type, name, version, base }: {
        type: DependencyType;
        name: string;
        version: string;
        base: string;
    });
    /** Dependency install name */
    name: string;
    /** Dependency install version range */
    version: string;
    /** The `package.json` file path to the dependent package */
    base: string;
    /** Dependency type */
    type: DependencyType;
    /** The resolved Dependency, `undefined` if can not resolve. */
    get resolved(): PackageJsonImplementation;
    #private;
}
declare class PackageJsonImplementation extends EnumerableGetters {
    static "__#private@#instanceCache": Map<string, PackageJsonImplementation>;
    /**
    @param {string} packageJsonFile
    */
    static create(packageJsonFile: string): PackageJsonImplementation;
    /**
    @internal
    @param {string} packageJsonFile
    */
    constructor(packageJsonFile: string);
    /** Path to the `package.json` file */
    file: string;
    /** The package name */
    get name(): string;
    /** The package version */
    get version(): string;
    /** The `package.json` file data */
    get data(): PackageJsonData;
    /** Map of `dependencies` in the `package.json` file */
    get dependencies(): Map<string, DependencyImplementation<"dependencies">>;
    /** Map of `devDependencies` in the `package.json` file */
    get devDependencies(): Map<string, DependencyImplementation<"devDependencies">>;
    /** Map of `peerDependencies` in the `package.json` file */
    get peerDependencies(): Map<string, DependencyImplementation<"peerDependencies">>;
    #private;
}
declare class EnumerableGetters {
}
