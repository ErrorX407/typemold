/**
 * typemold
 * A lightweight, high-performance object mapper for TypeScript and Node.js
 *
 * @author Chetan Joshi
 * @license MIT
 *
 * @example
 * // Basic mapping
 * import { Mapper, MapFrom, AutoMap } from 'typemold';
 *
 * class UserDto {
 *   @AutoMap()
 *   username: string;
 *
 *   @MapFrom('profile.avatar')
 *   avatar: string;
 *
 *   @MapFrom((src) => src.age >= 18)
 *   isAdult: boolean;
 * }
 *
 * const userDto = Mapper.map(userEntity, UserDto);
 *
 * @example
 * // Runtime field projection
 * const minimal = Mapper.map(user, UserDto, { pick: ['username', 'avatar'] });
 * const safe = Mapper.map(user, UserDto, { omit: ['email', 'password'] });
 * const public = Mapper.map(user, UserDto, { group: 'public' });
 *
 * @example
 * // NestJS integration (import from 'typemold/nestjs')
 * import { MapperModule, MapperService } from 'typemold/nestjs';
 *
 * @Module({
 *   imports: [MapperModule.forRoot()],
 * })
 * export class AppModule {}
 */

// Core Mapper
export { Mapper } from "./mapper";

// Decorators
export {
  MapFrom,
  createMapping,
  TypedMappingConfig,
  PathsOf,
  AutoMap,
  FieldGroup,
  createFieldGroups,
  GroupsOf,
  Groups,
  BuiltInGroup,
  Ignore,
  NestedType,
} from "./decorators";

// Types
export {
  Constructor,
  TransformFn,
  PropertyPath,
  MapOptions,
  MappingContext,
  TypeConverter,
  PropertyMappingConfig,
  CompiledMapper,
  METADATA_KEYS,
} from "./types";

// Registry (for advanced usage)
export { MappingRegistry, MapperFactory } from "./registry";

// Utilities
export {
  getNestedValue,
  pickKeys,
  omitKeys,
  isPlainObject,
  isClassInstance,
} from "./utils";

// NOTE: NestJS integration is available via 'typemold/nestjs' subpath
// import { MapperModule, MapperService } from 'typemold/nestjs';
