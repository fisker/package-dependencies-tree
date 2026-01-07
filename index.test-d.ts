import {expectType, expectNotType} from 'tsd'
import getPackageDependencies, {
  type PackageJson,
  type Dependency,
} from './index.js'

const packageJson = getPackageDependencies()
expectType<PackageJson>(packageJson)
expectType<string>(packageJson.name)
expectType<string>(packageJson.version)
expectType<string>(packageJson.file)
expectType<string>(packageJson.data.name)
expectType<string>(packageJson.data.version)
expectType<"dependencies">(packageJson.dependencies.get('package-name')!.type)
expectNotType<"dependencies">(packageJson.devDependencies.get('package-name')!.type)

const dependency = packageJson.dependencies.get('package-name')!
expectType<Dependency>(dependency)
expectType<string>(dependency.name)
expectType<string>(dependency.version)
expectType<string>(dependency.base)
expectType<string>(dependency.type)
expectType<string>(dependency.file)
expectType<PackageJson>(dependency.resolved)

expectType<PackageJson>(getPackageDependencies('/path/to/directory/'))
expectType<PackageJson>(
  getPackageDependencies(`/path/to/directory/package.json`),
)
expectType<PackageJson>(getPackageDependencies(new URL('./', import.meta.url)))
expectType<PackageJson>(
  getPackageDependencies(new URL('./package.json', import.meta.url)),
)
