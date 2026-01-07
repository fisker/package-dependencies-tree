import {expectType, expectNotType, expectAssignable} from 'tsd'
import getDependencies, {
  type PackageJson,
  type Dependency,
} from './index.js'

const packageJson = getDependencies()
expectType<PackageJson>(packageJson)
expectType<string>(packageJson.name)
expectType<string>(packageJson.version)
expectType<string>(packageJson.file)
expectType<string>(packageJson.data.name)
expectType<string>(packageJson.data.version)
expectType<"dependencies">(packageJson.dependencies.get('package-name')!.type)
expectNotType<"dependencies">(packageJson.devDependencies.get('package-name')!.type)

const dependency = packageJson.dependencies.get('package-name')!
expectAssignable<Dependency>(dependency)
expectType<string>(dependency.name)
expectType<string>(dependency.version)
expectType<string>(dependency.base)
expectAssignable<string>(dependency.type)
expectType<PackageJson>(dependency.resolved)

expectType<PackageJson>(getDependencies('/path/to/directory/'))
expectType<PackageJson>(
  getDependencies(`/path/to/directory/package.json`),
)
expectType<PackageJson>(getDependencies(new URL('./', import.meta.url)))
expectType<PackageJson>(
  getDependencies(new URL('./package.json', import.meta.url)),
)
