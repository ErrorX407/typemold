/**
 * @sevirial/nest-mapper - Core Mapper
 * Main mapper class with static methods for easy usage
 */

import "reflect-metadata";
import {
  Constructor,
  MapOptions,
  MappingContext,
  CompiledMapper,
  TypeConverter,
  METADATA_KEYS,
} from "./types";
import { MapperFactory, MappingRegistry } from "./registry";

/**
 * Main Mapper class - provides static methods for object mapping
 *
 * @example
 * // Basic usage
 * const userDto = Mapper.map(userEntity, UserDto);
 *
 * @example
 * // With field projection
 * const minimalUser = Mapper.map(userEntity, UserDto, { pick: ['username', 'avatar'] });
 *
 * @example
 * // With field groups
 * const publicUser = Mapper.map(userEntity, UserDto, { group: 'public' });
 *
 * @example
 * // Array mapping
 * const userDtos = Mapper.mapArray(users, UserDto);
 */
export class Mapper {
  private static typeConverters: TypeConverter[] = [];
  private static globalContext: MappingContext = {};

  /**
   * Maps a source object to a target DTO class
   *
   * @param source - Source object to map from
   * @param targetType - Target DTO class constructor
   * @param options - Optional mapping options for field projection
   * @returns Mapped target object
   */
  static map<TSource, TTarget>(
    source: TSource,
    targetType: Constructor<TTarget>,
    options?: MapOptions<TTarget>
  ): TTarget {
    if (source == null) {
      return null as unknown as TTarget;
    }

    const mapper = MapperFactory.createMapper<TSource, TTarget>(
      targetType,
      options
    );
    const context: MappingContext = {
      ...this.globalContext,
      extras: options?.extras,
      depth: 0,
      visited: new WeakMap(),
    };

    return mapper(source, context);
  }

  /**
   * Maps an array of source objects to target DTOs
   *
   * @param sources - Array of source objects
   * @param targetType - Target DTO class constructor
   * @param options - Optional mapping options for field projection
   * @returns Array of mapped target objects
   */
  static mapArray<TSource, TTarget>(
    sources: TSource[],
    targetType: Constructor<TTarget>,
    options?: MapOptions<TTarget>
  ): TTarget[] {
    if (!sources || !Array.isArray(sources)) {
      return [];
    }

    const mapper = MapperFactory.createMapper<TSource, TTarget>(
      targetType,
      options
    );
    const context: MappingContext = {
      ...this.globalContext,
      extras: options?.extras,
      depth: 0,
      visited: new WeakMap(),
    };

    const result: TTarget[] = new Array(sources.length);
    for (let i = 0; i < sources.length; i++) {
      result[i] =
        sources[i] != null
          ? mapper(sources[i], context)
          : (null as unknown as TTarget);
    }

    return result;
  }

  /**
   * Maps source to target and returns only specified fields (shorthand)
   *
   * @example
   * const result = Mapper.pick(user, UserDto, ['username', 'avatar']);
   */
  static pick<TSource, TTarget, K extends keyof TTarget>(
    source: TSource,
    targetType: Constructor<TTarget>,
    fields: K[]
  ): Pick<TTarget, K> {
    return this.map(source, targetType, {
      pick: fields as (keyof TTarget)[],
    }) as Pick<TTarget, K>;
  }

  /**
   * Maps source to target excluding specified fields (shorthand)
   *
   * @example
   * const result = Mapper.omit(user, UserDto, ['password', 'email']);
   */
  static omit<TSource, TTarget, K extends keyof TTarget>(
    source: TSource,
    targetType: Constructor<TTarget>,
    fields: K[]
  ): Omit<TTarget, K> {
    return this.map(source, targetType, {
      omit: fields as (keyof TTarget)[],
    }) as Omit<TTarget, K>;
  }

  /**
   * Maps source using a predefined field group (shorthand)
   *
   * @example
   * const result = Mapper.group(user, UserDto, 'minimal');
   */
  static group<TSource, TTarget>(
    source: TSource,
    targetType: Constructor<TTarget>,
    groupName: string
  ): Partial<TTarget> {
    return this.map(source, targetType, { group: groupName });
  }

  /**
   * Creates a reusable mapper function for better performance in loops
   *
   * @example
   * const mapToUserDto = Mapper.createMapper(UserDto);
   * const users = entities.map(mapToUserDto);
   */
  static createMapper<TSource, TTarget>(
    targetType: Constructor<TTarget>,
    options?: MapOptions<TTarget>
  ): (source: TSource) => TTarget {
    const compiledMapper = MapperFactory.createMapper<TSource, TTarget>(
      targetType,
      options
    );
    const context: MappingContext = {
      ...this.globalContext,
      extras: options?.extras,
    };

    return (source: TSource) => compiledMapper(source, context);
  }

  /**
   * Registers a type converter for automatic type transformations
   */
  static registerConverter<TSource, TTarget>(
    converter: TypeConverter<TSource, TTarget>
  ): void {
    this.typeConverters.push(converter);
  }

  /**
   * Sets global context that will be available to all transform functions
   */
  static setGlobalContext(context: Partial<MappingContext>): void {
    this.globalContext = { ...this.globalContext, ...context };
  }

  /**
   * Clears all cached mappers (useful for testing or hot-reload scenarios)
   */
  static clearCache(): void {
    MappingRegistry.clearCache();
  }

  /**
   * Gets the compiled mapper for inspection (useful for debugging)
   */
  static getCompiledMapper<TSource, TTarget>(
    targetType: Constructor<TTarget>,
    options?: MapOptions<TTarget>
  ): CompiledMapper<TSource, TTarget> | undefined {
    const optionsKey = MappingRegistry.getOptionsKey(options);
    return MappingRegistry.getCompiledMapper<TSource, TTarget>(
      targetType,
      optionsKey
    );
  }
}
