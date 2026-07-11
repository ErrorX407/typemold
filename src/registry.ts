/**
 * tremap - Mapping Registry
 * Singleton registry for storing and caching mapping configurations
 */

import "reflect-metadata";
import {
  Constructor,
  MappingRegistryEntry,
  PropertyMappingConfig,
  CompiledMapper,
  METADATA_KEYS,
  MapOptions,
  MappingContext,
  TypeConverter,
} from "./types";
import { getNestedValue } from "./utils";

/**
 * Global mapping registry - singleton pattern for performance
 */
class MappingRegistryClass {
  private readonly registry = new Map<Constructor, MappingRegistryEntry>();
  // NOTE: intentionally a Map (not WeakMap) so clearCache() can invalidate
  // compiled mappers. Constructors are long-lived, so retention is a non-issue.
  private readonly compiledMappers = new Map<
    Constructor,
    Map<string, CompiledMapper>
  >();

  /**
   * Gets or creates a registry entry for a target DTO class
   */
  getEntry<TTarget>(
    targetType: Constructor<TTarget>,
  ): MappingRegistryEntry<unknown, TTarget> {
    let entry = this.registry.get(targetType);

    if (!entry) {
      entry = this.createEntryFromMetadata(targetType);
      this.registry.set(targetType, entry);
    }

    return entry;
  }

  /**
   * Creates a mapping entry by reading decorator metadata
   */
  private createEntryFromMetadata<TTarget>(
    targetType: Constructor<TTarget>,
  ): MappingRegistryEntry<unknown, TTarget> {
    const propertyMappings: Map<string, PropertyMappingConfig> =
      Reflect.getMetadata(METADATA_KEYS.PROPERTY_MAPPINGS, targetType) ||
      new Map();

    const fieldGroups: Map<string, Set<string>> = Reflect.getMetadata(
      METADATA_KEYS.FIELD_GROUPS,
      targetType,
    ) || new Map();

    // Attach @NestedType factories (stored per-property) onto each config so
    // the compiled mapper can recurse into nested DTOs.
    for (const config of propertyMappings.values()) {
      const nestedType = Reflect.getMetadata(
        METADATA_KEYS.NESTED_TYPE,
        targetType,
        config.targetKey,
      ) as (() => Constructor) | undefined;
      if (nestedType) {
        config.nestedType = nestedType;
      }
    }

    return {
      targetType,
      propertyConfigs: propertyMappings,
      fieldGroups,
    };
  }

  /**
   * Gets a compiled mapper for the given target type and options signature
   */
  getCompiledMapper<TSource, TTarget>(
    targetType: Constructor<TTarget>,
    optionsKey: string = "default",
  ): CompiledMapper<TSource, TTarget> | undefined {
    const typeMappers = this.compiledMappers.get(targetType);
    return typeMappers?.get(optionsKey);
  }

  /**
   * Stores a compiled mapper for reuse
   */
  setCompiledMapper<TSource, TTarget>(
    targetType: Constructor<TTarget>,
    optionsKey: string,
    mapper: CompiledMapper<TSource, TTarget>,
  ): void {
    let typeMappers = this.compiledMappers.get(targetType);
    if (!typeMappers) {
      typeMappers = new Map();
      this.compiledMappers.set(targetType, typeMappers);
    }
    typeMappers.set(optionsKey, mapper);
  }

  /**
   * Clears all cached mappers and metadata entries (useful for testing and
   * hot-reload). Must invalidate BOTH caches, otherwise a re-read of metadata
   * would still return a stale compiled mapper.
   */
  clearCache(): void {
    this.registry.clear();
    this.compiledMappers.clear();
  }

  /**
   * Generates a stable, collision-resistant cache key for mapping options.
   *
   * Precedence (must match getPropertiesToMap): group > pick > omit.
   * Field names are JSON-encoded so that e.g. ['a','b'] and ['a,b'] cannot
   * collide, and a copy is sorted so we never mutate the caller's array.
   */
  getOptionsKey<TTarget>(options?: MapOptions<TTarget>): string {
    if (!options) return "default";
    if (options.group) return `group:${options.group}`;
    if (options.pick) {
      return `pick:${JSON.stringify([...options.pick].map(String).sort())}`;
    }
    if (options.omit) {
      return `omit:${JSON.stringify([...options.omit].map(String).sort())}`;
    }
    return "default";
  }
}

/**
 * Singleton instance
 */
export const MappingRegistry = new MappingRegistryClass();

/**
 * Mapper Factory - Creates optimized mapping functions
 */
export class MapperFactory {
  /**
   * Creates a compiled mapper for the given target type with optional field projection
   */
  static createMapper<TSource, TTarget>(
    targetType: Constructor<TTarget>,
    options?: MapOptions<TTarget>,
  ): CompiledMapper<TSource, TTarget> {
    const entry = MappingRegistry.getEntry(targetType);
    const optionsKey = MappingRegistry.getOptionsKey(options);

    // Check cache first
    let compiledMapper = MappingRegistry.getCompiledMapper<TSource, TTarget>(
      targetType,
      optionsKey,
    );

    if (compiledMapper) {
      return compiledMapper;
    }

    // Determine which properties to include
    const propertiesToMap = this.getPropertiesToMap(entry, options);

    // Build the compiled mapper
    compiledMapper = this.buildMapper<TSource, TTarget>(
      targetType,
      entry,
      propertiesToMap,
    );

    // Cache for reuse
    MappingRegistry.setCompiledMapper(targetType, optionsKey, compiledMapper);

    return compiledMapper;
  }

  /**
   * Determines which properties to map based on options
   */
  private static getPropertiesToMap<TTarget>(
    entry: MappingRegistryEntry<unknown, TTarget>,
    options?: MapOptions<TTarget>,
  ): PropertyMappingConfig[] {
    const allConfigs = Array.from(entry.propertyConfigs.values()).filter(
      (config) => !config.ignore,
    );

    if (!options) {
      return allConfigs;
    }

    // Precedence (must match getOptionsKey): group > pick > omit.

    // Field group selection
    if (options.group) {
      const groupFields = entry.fieldGroups.get(options.group);
      if (groupFields) {
        return allConfigs.filter((config) => groupFields.has(config.targetKey));
      }
      return []; // Group not found, return empty
    }

    // Pick specific fields. An explicit empty array means "no fields".
    if (options.pick !== undefined) {
      const pickSet = new Set(options.pick.map(String));
      return allConfigs.filter((config) => pickSet.has(config.targetKey));
    }

    // Omit specific fields. An explicit empty array means "all fields".
    if (options.omit !== undefined) {
      const omitSet = new Set(options.omit.map(String));
      return allConfigs.filter((config) => !omitSet.has(config.targetKey));
    }

    return allConfigs;
  }

  /**
   * Builds an optimized mapping function
   */
  private static buildMapper<TSource, TTarget>(
    targetType: Constructor<TTarget>,
    entry: MappingRegistryEntry<unknown, TTarget>,
    properties: PropertyMappingConfig[],
  ): CompiledMapper<TSource, TTarget> {
    // Separate mappings by kind for a tight per-object hot path.
    const pathMappings: Array<{ target: string; source: string }> = [];
    const transformMappings: Array<{
      target: string;
      transform: (src: TSource, ctx?: MappingContext) => unknown;
    }> = [];
    const nestedMappings: Array<{
      target: string;
      source: string;
      typeFactory: () => Constructor;
    }> = [];

    for (const prop of properties) {
      if (prop.isTransform && typeof prop.source === "function") {
        transformMappings.push({
          target: prop.targetKey,
          transform: prop.source as (
            src: TSource,
            ctx?: MappingContext,
          ) => unknown,
        });
      } else if (prop.nestedType) {
        nestedMappings.push({
          target: prop.targetKey,
          source: prop.source as string,
          typeFactory: prop.nestedType,
        });
      } else {
        pathMappings.push({
          target: prop.targetKey,
          source: prop.source as string,
        });
      }
    }

    // Return optimized mapper function
    return (source: TSource, context?: MappingContext): TTarget => {
      if (source == null) {
        return null as unknown as TTarget;
      }

      // Circular-reference protection: return the already-mapped instance
      // for a source object we are currently mapping.
      const visited = context?.visited;
      if (visited && typeof source === "object") {
        const existing = visited.get(source as object);
        if (existing !== undefined) {
          return existing as TTarget;
        }
      }

      const result = new targetType() as Record<string, unknown>;

      // Register BEFORE recursing so cycles resolve to this instance.
      if (visited && typeof source === "object") {
        visited.set(source as object, result);
      }

      const converters = context?.converters;

      // Apply path mappings (optionally run through registered converters)
      for (let i = 0; i < pathMappings.length; i++) {
        const mapping = pathMappings[i];
        const value = getNestedValue(
          source as Record<string, unknown>,
          mapping.source,
        );
        result[mapping.target] =
          converters && converters.length
            ? applyConverters(value, converters)
            : value;
      }

      // Apply nested-type mappings (recursive, cycle- and depth-safe)
      for (let i = 0; i < nestedMappings.length; i++) {
        const mapping = nestedMappings[i];
        const raw = getNestedValue(
          source as Record<string, unknown>,
          mapping.source,
        );
        result[mapping.target] = mapNestedValue(
          raw,
          mapping.typeFactory,
          context,
        );
      }

      // Apply transform mappings
      for (let i = 0; i < transformMappings.length; i++) {
        const mapping = transformMappings[i];
        result[mapping.target] = mapping.transform(source, context);
      }

      return result as TTarget;
    };
  }
}

/** Default hard ceiling on nested recursion depth. */
const DEFAULT_MAX_DEPTH = 100;

/**
 * Applies the first registered converter whose source type matches the value's
 * runtime type. Precedence is caller order (first match wins).
 */
function applyConverters(value: unknown, converters: TypeConverter[]): unknown {
  if (value == null) return value;
  for (let i = 0; i < converters.length; i++) {
    const c = converters[i];
    const matches =
      typeof c.sourceType === "function"
        ? value instanceof (c.sourceType as Constructor)
        : typeof value === c.sourceType;
    if (matches) {
      return c.convert(value);
    }
  }
  return value;
}

/**
 * Maps a raw source value to a nested DTO (or array of them), threading the
 * mapping context so cycle detection and depth limiting work across levels.
 */
function mapNestedValue(
  value: unknown,
  typeFactory: () => Constructor,
  context?: MappingContext,
): unknown {
  if (value == null) return value;

  const depth = context?.depth ?? 0;
  const maxDepth = context?.maxDepth ?? DEFAULT_MAX_DEPTH;
  if (depth >= maxDepth) return value; // safety net against runaway recursion

  const childContext: MappingContext = {
    ...context,
    depth: depth + 1,
    visited: context?.visited ?? new WeakMap<object, unknown>(),
  };

  const nestedType = typeFactory();
  const nestedMapper = MapperFactory.createMapper(nestedType);

  if (Array.isArray(value)) {
    const out = new Array(value.length);
    for (let i = 0; i < value.length; i++) {
      out[i] = value[i] == null ? value[i] : nestedMapper(value[i], childContext);
    }
    return out;
  }

  return nestedMapper(value, childContext);
}
