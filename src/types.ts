/**
 * typemold - Type Definitions
 * Core types for the high-performance object mapper
 */

/**
 * Constructor type for class instantiation
 */
export type Constructor<T = any> = new (...args: any[]) => T;

/**
 * Transform function that converts source value to target value
 */
export type TransformFn<TSource = any, TResult = any> = (
  source: TSource,
  context?: MappingContext
) => TResult;

/**
 * Property path as string (supports nested paths like 'profile.avatar')
 */
export type PropertyPath = string;

/**
 * Mapping configuration for a single property
 */
export interface PropertyMappingConfig {
  /** Target property name on the DTO */
  targetKey: string;
  /** Source property path or transform function */
  source: PropertyPath | TransformFn;
  /** Whether this is a transform function */
  isTransform: boolean;
  /** Field groups this property belongs to */
  groups: string[];
  /** Whether to ignore this property */
  ignore: boolean;
}

/**
 * Compiled mapping function for optimal performance
 */
export type CompiledMapper<TSource = any, TTarget = any> = (
  source: TSource,
  context?: MappingContext
) => TTarget;

/**
 * Context passed during mapping operations
 */
export interface MappingContext {
  /** Extra data available to transform functions */
  extras?: Record<string, unknown>;
  /** Current depth for circular reference detection */
  depth?: number;
  /** Already mapped objects for circular reference handling */
  visited?: WeakMap<object, unknown>;
}

/**
 * Options for mapping operations with runtime field projection
 */
export interface MapOptions<TTarget = any> {
  /**
   * Pick only specific fields from the target DTO
   * @example { pick: ['username', 'avatar'] }
   */
  pick?: (keyof TTarget)[];

  /**
   * Omit specific fields from the target DTO
   * @example { omit: ['password', 'email'] }
   */
  omit?: (keyof TTarget)[];

  /**
   * Use a predefined field group
   * @example { group: 'minimal' }
   */
  group?: string;

  /**
   * Extra context data available to transform functions
   */
  extras?: Record<string, unknown>;
}

/**
 * Configuration for the MapperModule
 */
export interface MapperModuleOptions {
  /**
   * Enable validation integration with class-validator
   * @default false
   */
  enableValidation?: boolean;

  /**
   * Global options applied to all mappings
   */
  globalOptions?: Partial<MapOptions>;

  /**
   * Custom type converters
   */
  converters?: TypeConverter[];
}

/**
 * Type converter for automatic type transformations
 */
export interface TypeConverter<TSource = any, TTarget = any> {
  /** Source type to convert from */
  sourceType: Constructor<TSource> | string;
  /** Target type to convert to */
  targetType: Constructor<TTarget> | string;
  /** Conversion function */
  convert: (value: TSource) => TTarget;
}

/**
 * Metadata key constants
 */
export const METADATA_KEYS = {
  PROPERTY_MAPPINGS: Symbol("sevirial:property-mappings"),
  FIELD_GROUPS: Symbol("sevirial:field-groups"),
  AUTO_MAP: Symbol("sevirial:auto-map"),
  IGNORE: Symbol("sevirial:ignore"),
  NESTED_TYPE: Symbol("sevirial:nested-type"),
} as const;

/**
 * Internal mapping registry entry
 */
export interface MappingRegistryEntry<TSource = any, TTarget = any> {
  sourceType?: Constructor<TSource>;
  targetType: Constructor<TTarget>;
  compiledMapper?: CompiledMapper<TSource, TTarget>;
  propertyConfigs: Map<string, PropertyMappingConfig>;
  fieldGroups: Map<string, Set<string>>;
}
