/**
 * @sevirial/nest-mapper - Mapping Registry
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
} from "./types";
import { getNestedValue, pickKeys, omitKeys } from "./utils";

/**
 * Global mapping registry - singleton pattern for performance
 */
class MappingRegistryClass {
  private readonly registry = new Map<Constructor, MappingRegistryEntry>();
  private readonly compiledMappers = new WeakMap<
    Constructor,
    Map<string, CompiledMapper>
  >();

  /**
   * Gets or creates a registry entry for a target DTO class
   */
  getEntry<TTarget>(
    targetType: Constructor<TTarget>
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
    targetType: Constructor<TTarget>
  ): MappingRegistryEntry<unknown, TTarget> {
    const propertyMappings: Map<string, PropertyMappingConfig> =
      Reflect.getMetadata(METADATA_KEYS.PROPERTY_MAPPINGS, targetType) ||
      new Map();

    const fieldGroups: Map<string, Set<string>> = Reflect.getMetadata(
      METADATA_KEYS.FIELD_GROUPS,
      targetType
    ) || new Map();

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
    optionsKey: string = "default"
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
    mapper: CompiledMapper<TSource, TTarget>
  ): void {
    let typeMappers = this.compiledMappers.get(targetType);
    if (!typeMappers) {
      typeMappers = new Map();
      this.compiledMappers.set(targetType, typeMappers);
    }
    typeMappers.set(optionsKey, mapper);
  }

  /**
   * Clears all cached mappers (useful for testing)
   */
  clearCache(): void {
    this.registry.clear();
  }

  /**
   * Generates a cache key for mapping options
   */
  getOptionsKey<TTarget>(options?: MapOptions<TTarget>): string {
    if (!options) return "default";
    if (options.pick) return `pick:${options.pick.sort().join(",")}`;
    if (options.omit) return `omit:${options.omit.sort().join(",")}`;
    if (options.group) return `group:${options.group}`;
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
    options?: MapOptions<TTarget>
  ): CompiledMapper<TSource, TTarget> {
    const entry = MappingRegistry.getEntry(targetType);
    const optionsKey = MappingRegistry.getOptionsKey(options);

    // Check cache first
    let compiledMapper = MappingRegistry.getCompiledMapper<TSource, TTarget>(
      targetType,
      optionsKey
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
      propertiesToMap
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
    options?: MapOptions<TTarget>
  ): PropertyMappingConfig[] {
    const allConfigs = Array.from(entry.propertyConfigs.values()).filter(
      (config) => !config.ignore
    );

    if (!options) {
      return allConfigs;
    }

    // Field group selection
    if (options.group) {
      const groupFields = entry.fieldGroups.get(options.group);
      if (groupFields) {
        return allConfigs.filter((config) => groupFields.has(config.targetKey));
      }
      return []; // Group not found, return empty
    }

    // Pick specific fields
    if (options.pick && options.pick.length > 0) {
      const pickSet = new Set(options.pick.map(String));
      return allConfigs.filter((config) => pickSet.has(config.targetKey));
    }

    // Omit specific fields
    if (options.omit && options.omit.length > 0) {
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
    properties: PropertyMappingConfig[]
  ): CompiledMapper<TSource, TTarget> {
    // Separate transform functions from path mappings for optimization
    const pathMappings: Array<{ target: string; source: string }> = [];
    const transformMappings: Array<{
      target: string;
      transform: (src: TSource, ctx?: MappingContext) => unknown;
    }> = [];

    for (const prop of properties) {
      if (prop.isTransform && typeof prop.source === "function") {
        transformMappings.push({
          target: prop.targetKey,
          transform: prop.source as (
            src: TSource,
            ctx?: MappingContext
          ) => unknown,
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

      // Create new instance or plain object based on target type
      const result = new targetType() as Record<string, unknown>;

      // Apply path mappings (optimized)
      for (let i = 0; i < pathMappings.length; i++) {
        const mapping = pathMappings[i];
        result[mapping.target] = getNestedValue(
          source as Record<string, unknown>,
          mapping.source
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
