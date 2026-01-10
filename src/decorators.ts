/**
 * @sevirial/nest-mapper - Decorators
 * Property decorators for defining mapping configurations
 */

import "reflect-metadata";
import {
  METADATA_KEYS,
  PropertyPath,
  TransformFn,
  PropertyMappingConfig,
  Constructor,
} from "./types";

/**
 * Maps a property from a source path or using a transform function.
 *
 * @example
 * // Direct property mapping
 * class UserDto {
 *   @MapFrom('firstName')
 *   name: string;
 * }
 *
 * @example
 * // Nested path mapping
 * class UserDto {
 *   @MapFrom('profile.avatar')
 *   avatarUrl: string;
 * }
 *
 * @example
 * // Transform function with typed source
 * class UserDto {
 *   @MapFrom<User>((src) => src.age >= 18)  // ← IntelliSense for src!
 *   isAdult: boolean;
 * }
 */
export function MapFrom<TSource = any>(
  sourcePathOrTransform: PropertyPath | TransformFn<TSource>
): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    const key = String(propertyKey);
    const existingMappings: Map<string, PropertyMappingConfig> =
      Reflect.getMetadata(
        METADATA_KEYS.PROPERTY_MAPPINGS,
        target.constructor
      ) || new Map();

    const existingConfig =
      existingMappings.get(key) || createDefaultConfig(key);

    if (typeof sourcePathOrTransform === "function") {
      existingConfig.source = sourcePathOrTransform;
      existingConfig.isTransform = true;
    } else {
      existingConfig.source = sourcePathOrTransform;
      existingConfig.isTransform = false;
    }

    existingMappings.set(key, existingConfig);
    Reflect.defineMetadata(
      METADATA_KEYS.PROPERTY_MAPPINGS,
      existingMappings,
      target.constructor
    );
  };
}

/**
 * Creates a type-safe mapping configuration with full IntelliSense support.
 * Use this builder pattern when you need autocomplete for source paths.
 *
 * @example
 * interface User {
 *   username: string;
 *   profile: { avatar: string; bio: string };
 * }
 *
 * // Option 1: Define mappings with full autocomplete
 * const toUserDto = createMapping<User, UserDto>({
 *   avatar: 'profile.avatar',        // ✨ Autocomplete for paths!
 *   bio: src => src.profile.bio,     // ✨ Autocomplete for transforms!
 * });
 *
 * // Usage
 * const dto = toUserDto(userEntity);
 *
 * @example
 * // Option 2: Use with Mapper
 * const dto = Mapper.mapWith(user, toUserDto);
 */
export function createMapping<TSource, TTarget>(
  mappings: TypedMappingConfig<TSource, TTarget>
): (source: TSource) => Partial<TTarget> {
  return (source: TSource): Partial<TTarget> => {
    const result = {} as Record<string, unknown>;

    for (const [targetKey, sourcePathOrFn] of Object.entries(mappings)) {
      if (typeof sourcePathOrFn === "function") {
        result[targetKey] = (sourcePathOrFn as (s: TSource) => unknown)(source);
      } else {
        result[targetKey] = getNestedValueTyped(
          source,
          sourcePathOrFn as string
        );
      }
    }

    return result as Partial<TTarget>;
  };
}

/**
 * Type-safe mapping configuration object.
 * Keys are target DTO properties, values are source paths or transform functions.
 */
export type TypedMappingConfig<TSource, TTarget> = {
  [K in keyof TTarget]?: PathsOf<TSource> | ((source: TSource) => TTarget[K]);
};

/**
 * Helper to get nested value with type safety
 */
function getNestedValueTyped(obj: unknown, path: string): unknown {
  if (obj == null) return undefined;
  const segments = path.split(".");
  let current: unknown = obj;
  for (const segment of segments) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

/**
 * Utility type that extracts all possible dot-notation paths from an object type.
 * Provides IntelliSense for nested property paths.
 *
 * @example
 * type User = { profile: { avatar: string } };
 * type Paths = PathsOf<User>; // 'profile' | 'profile.avatar'
 */
export type PathsOf<T, Depth extends number = 3> = Depth extends 0
  ? never
  : T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? K | `${K}.${PathsOf<T[K], Prev[Depth]>}`
        : K;
    }[keyof T & string]
  : never;

// Helper type for depth limiting (prevents infinite recursion)
type Prev = [never, 0, 1, 2, 3];

/**
 * Automatically maps a property with the same name from source.
 *
 * @example
 * class UserDto {
 *   @AutoMap()
 *   username: string;  // Maps from source.username
 * }
 */
export function AutoMap(): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    const key = String(propertyKey);
    const existingMappings: Map<string, PropertyMappingConfig> =
      Reflect.getMetadata(
        METADATA_KEYS.PROPERTY_MAPPINGS,
        target.constructor
      ) || new Map();

    const existingConfig =
      existingMappings.get(key) || createDefaultConfig(key);
    existingConfig.source = key; // Same name mapping
    existingConfig.isTransform = false;

    existingMappings.set(key, existingConfig);
    Reflect.defineMetadata(
      METADATA_KEYS.PROPERTY_MAPPINGS,
      existingMappings,
      target.constructor
    );
    Reflect.defineMetadata(
      METADATA_KEYS.AUTO_MAP,
      true,
      target.constructor,
      key
    );
  };
}

/**
 * Assigns a property to one or more field groups for runtime projection.
 *
 * @example
 * // Basic usage with strings
 * class UserDto {
 *   @FieldGroup('minimal', 'public')
 *   @AutoMap()
 *   username: string;
 * }
 *
 * @example
 * // Type-safe usage with const object (recommended for autocomplete!)
 * const Groups = createFieldGroups('minimal', 'public', 'full');
 *
 * class UserDto {
 *   @FieldGroup(Groups.minimal, Groups.public)  // ✨ Autocomplete!
 *   @AutoMap()
 *   username: string;
 * }
 */
export function FieldGroup(...groups: string[]): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    const key = String(propertyKey);
    const existingMappings: Map<string, PropertyMappingConfig> =
      Reflect.getMetadata(
        METADATA_KEYS.PROPERTY_MAPPINGS,
        target.constructor
      ) || new Map();

    const existingConfig =
      existingMappings.get(key) || createDefaultConfig(key);
    existingConfig.groups = [...new Set([...existingConfig.groups, ...groups])];

    existingMappings.set(key, existingConfig);
    Reflect.defineMetadata(
      METADATA_KEYS.PROPERTY_MAPPINGS,
      existingMappings,
      target.constructor
    );

    // Also store in field groups map for quick lookup
    const fieldGroups: Map<string, Set<string>> = Reflect.getMetadata(
      METADATA_KEYS.FIELD_GROUPS,
      target.constructor
    ) || new Map();

    for (const group of groups) {
      const groupSet = fieldGroups.get(group) || new Set();
      groupSet.add(key);
      fieldGroups.set(group, groupSet);
    }

    Reflect.defineMetadata(
      METADATA_KEYS.FIELD_GROUPS,
      fieldGroups,
      target.constructor
    );
  };
}

/**
 * Creates a type-safe field groups object with autocomplete support.
 * Use this to define your groups once and get IntelliSense everywhere!
 *
 * @example
 * // Define groups once
 * export const UserGroups = createFieldGroups('minimal', 'public', 'full');
 *
 * class UserDto {
 *   @FieldGroup(UserGroups.minimal, UserGroups.public)  // ✨ Autocomplete!
 *   @AutoMap()
 *   username: string;
 *
 *   @FieldGroup(UserGroups.full)
 *   @AutoMap()
 *   email: string;
 * }
 *
 * // Usage with type-safety
 * Mapper.map(user, UserDto, { group: UserGroups.minimal });  // ✨ Autocomplete!
 */
export function createFieldGroups<T extends string>(
  ...groups: T[]
): { readonly [K in T]: K } {
  const result = {} as { [K in T]: K };
  for (const group of groups) {
    result[group] = group;
  }
  return Object.freeze(result);
}

/**
 * Type for extracting group names from a created field groups object.
 * Useful for typing function parameters.
 *
 * @example
 * const Groups = createFieldGroups('minimal', 'public', 'full');
 * type GroupName = GroupsOf<typeof Groups>; // 'minimal' | 'public' | 'full'
 */
export type GroupsOf<T> = T extends { [K in infer U]: K } ? U : never;

/**
 * Built-in field groups with autocomplete - use these directly!
 * No need to define your own groups for common use cases.
 *
 * @example
 * class UserDto {
 *   @FieldGroup(Groups.MINIMAL, Groups.PUBLIC)  // ✨ Autocomplete!
 *   @AutoMap()
 *   username: string;
 *
 *   @FieldGroup(Groups.DETAILED)
 *   @AutoMap()
 *   email: string;
 * }
 *
 * // Usage
 * Mapper.map(user, UserDto, { group: Groups.MINIMAL });  // ✨ Autocomplete!
 */
export const Groups = Object.freeze({
  /** Minimal fields - just the essentials (e.g., id, name) */
  MINIMAL: "minimal",
  /** Summary fields - brief overview */
  SUMMARY: "summary",
  /** Public fields - safe to expose publicly */
  PUBLIC: "public",
  /** Private fields - internal use only */
  PRIVATE: "private",
  /** Detailed fields - comprehensive info */
  DETAILED: "detailed",
  /** Full fields - everything */
  FULL: "full",
  /** List view fields - for table/list displays */
  LIST: "list",
  /** Detail view fields - for detail pages */
  DETAIL: "detail",
  /** Admin fields - administrative data */
  ADMIN: "admin",
  /** API response fields */
  API: "api",
} as const);

/** Type representing all built-in group names */
export type BuiltInGroup = (typeof Groups)[keyof typeof Groups];

/**
 * Ignores a property during mapping.
 *
 * @example
 * class UserDto {
 *   @Ignore()
 *   internalId: string;  // Will not be mapped
 * }
 */
export function Ignore(): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    const key = String(propertyKey);
    const existingMappings: Map<string, PropertyMappingConfig> =
      Reflect.getMetadata(
        METADATA_KEYS.PROPERTY_MAPPINGS,
        target.constructor
      ) || new Map();

    const existingConfig =
      existingMappings.get(key) || createDefaultConfig(key);
    existingConfig.ignore = true;

    existingMappings.set(key, existingConfig);
    Reflect.defineMetadata(
      METADATA_KEYS.PROPERTY_MAPPINGS,
      existingMappings,
      target.constructor
    );
    Reflect.defineMetadata(METADATA_KEYS.IGNORE, true, target.constructor, key);
  };
}

/**
 * Specifies the type for nested object mapping.
 *
 * @example
 * class UserDto {
 *   @NestedType(() => AddressDto)
 *   @MapFrom('address')
 *   address: AddressDto;
 * }
 */
export function NestedType<T>(
  typeFactory: () => Constructor<T>
): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    Reflect.defineMetadata(
      METADATA_KEYS.NESTED_TYPE,
      typeFactory,
      target.constructor,
      String(propertyKey)
    );
  };
}

/**
 * Creates a default property mapping config
 */
function createDefaultConfig(targetKey: string): PropertyMappingConfig {
  return {
    targetKey,
    source: targetKey,
    isTransform: false,
    groups: [],
    ignore: false,
  };
}
