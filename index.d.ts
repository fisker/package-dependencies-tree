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
export type Dependency = DependencyImplementation<any>;
export type PackageJson = PackageJsonImplementation;
/**
@param {string | URL} [packageJsonFile]
@returns {PackageJson}
*/
declare function getPackageDependencies(packageJsonFile?: string | URL): PackageJson;
/**
@template {DependencyTypes} DependencyType
*/
declare class DependencyImplementation<DependencyType extends DependencyTypes> extends EnumerableGetters {
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
    name: string;
    version: string;
    base: string;
    type: DependencyType;
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
    get dependencies(): Map<string, DependencyImplementation<"dependencies">>;
    get devDependencies(): Map<string, DependencyImplementation<"devDependencies">>;
    get peerDependencies(): Map<string, DependencyImplementation<"peerDependencies">>;
    #private;
}
declare class EnumerableGetters {
}
