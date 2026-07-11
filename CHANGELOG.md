# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.1.0] - 2026-07-11

### Added

- **Nested mapping** — `@NestedType(() => Dto)` now actually deep-maps nested
  objects and arrays of objects into their target DTOs (previously a no-op).
- **Circular-reference safety** — self-referential sources resolve to the same
  mapped instance, with a recursion-depth ceiling.
- **Type converters** — converters registered via `Mapper.registerConverter` /
  `MapperModule.forRoot({ converters })` are now applied during mapping
  (previously registered but never used). Precedence: transform → converter → raw.
- `MappingValidationError` — typed error thrown by `MapperService.mapAndValidate`.
- Reproducible benchmark harness (`npm run benchmark`, `benchmarks/index.ts`).

### Fixed

- `Mapper.clearCache()` now also invalidates compiled mappers (was leaving stale
  cached mappers, breaking hot-reload / test isolation).
- Projection cache keys no longer mutate the caller's `pick`/`omit` array and no
  longer collide on comma-containing field names.
- NestJS validation is now deterministic — the class-validator import is awaited
  instead of fired-and-forgotten, so validation is never silently skipped.
- `MapperService` no longer mutates process-global `Mapper` state; converters and
  extras are held per service instance (fixes cross-module/test leakage).

### Changed

- **BREAKING (rename):** the package was renamed **`tmapper` → `tremap`** (the
  `tmapper` name is taken on other registries). Update imports from `tmapper` to
  `tremap`, and the NestJS subpath from `tmapper/nestjs` to `tremap/nestjs`. No
  runtime API changed as part of the rename.
- **BREAKING (behavioral):** `pick: []` now returns **no** fields (previously
  returned all fields). `omit: []` continues to return all fields. Projection
  precedence is documented as `group` → `pick` → `omit`.
- Removed a docs reference to a non-existent `Mapper.mapWith`; softened the
  performance table into reproducible benchmark instructions.

## [1.0.0] - 2026-01-10

### Added

- Initial release (published as `tmapper`; renamed to `tremap` in 3.1.0)
- Core `Mapper` class with `map()`, `mapArray()`, `pick()`, `omit()`, `group()` methods
- Decorators: `@MapFrom()`, `@AutoMap()`, `@FieldGroup()`, `@Ignore()`, `@NestedType()`
- Runtime field projection with pick/omit options
- Named field groups for reusable field sets
- NestJS integration with `MapperModule` and `MapperService`
- Optional class-validator integration
- Compiled mapper caching for high performance
- Full TypeScript strict mode support
- Dual ESM/CJS builds
