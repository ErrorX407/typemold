# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-01-10

### Added

- Initial release of typemold
- Core `Mapper` class with `map()`, `mapArray()`, `pick()`, `omit()`, `group()` methods
- Decorators: `@MapFrom()`, `@AutoMap()`, `@FieldGroup()`, `@Ignore()`, `@NestedType()`
- Runtime field projection with pick/omit options
- Named field groups for reusable field sets
- NestJS integration with `MapperModule` and `MapperService`
- Optional class-validator integration
- Compiled mapper caching for high performance
- Full TypeScript strict mode support
- Dual ESM/CJS builds
