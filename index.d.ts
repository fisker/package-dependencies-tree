export default getPackageDependencies;
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
@param {string | URL} [packageJsonFile]
@returns {PackageJson}
*/
declare function getPackageDependencies(packageJsonFile?: string | URL): PackageJson;
declare class DependencyImplementation extends EnumerableGetters {
    /**
    @param {{
      type: DependencyTypes,
      name: string,
      version: string,
      base: string,
    }} param0
    */
    constructor({ type, name, version, base }: {
        type: DependencyTypes;
        name: string;
        version: string;
        base: string;
    });
    name: string;
    version: string;
    base: string;
    type: DependencyTypes;
    get file(): string;
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
    file: string;
    get name(): string;
    get version(): string;
    get data(): PackageJsonData;
    get dependencies(): Map<string, DependencyImplementation>;
    get devDependencies(): Map<string, DependencyImplementation>;
    get peerDependencies(): Map<string, DependencyImplementation>;
    #private;
}
declare class EnumerableGetters {
}
