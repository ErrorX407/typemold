/**
 * @sevirial/nest-mapper - NestJS MapperService
 * Injectable service for NestJS dependency injection
 */

import { Injectable, Inject, Optional } from "@nestjs/common";
import { Mapper } from "../mapper";
import { Constructor, MapOptions, TypeConverter } from "../types";

/**
 * Injection token for MapperModule options
 */
export const MAPPER_OPTIONS = Symbol("MAPPER_OPTIONS");

/**
 * Options for MapperService
 */
export interface MapperServiceOptions {
  /**
   * Enable validation integration with class-validator
   */
  enableValidation?: boolean;

  /**
   * Custom type converters
   */
  converters?: TypeConverter[];

  /**
   * Global extras available to all transform functions
   */
  globalExtras?: Record<string, unknown>;
}

/**
 * Injectable mapper service for NestJS
 *
 * @example
 * @Injectable()
 * export class UserService {
 *   constructor(private readonly mapper: MapperService) {}
 *
 *   async getUser(id: string): Promise<UserDto> {
 *     const user = await this.userRepo.findOne(id);
 *     return this.mapper.map(user, UserDto);
 *   }
 * }
 */
@Injectable()
export class MapperService {
  private readonly options: MapperServiceOptions;
  private validator: { validate: (obj: object) => Promise<unknown[]> } | null =
    null;

  constructor(
    @Optional() @Inject(MAPPER_OPTIONS) options?: MapperServiceOptions
  ) {
    this.options = options || {};

    // Register custom converters if provided
    if (this.options.converters) {
      for (const converter of this.options.converters) {
        Mapper.registerConverter(converter);
      }
    }

    // Set global context if extras provided
    if (this.options.globalExtras) {
      Mapper.setGlobalContext({ extras: this.options.globalExtras });
    }

    // Try to load class-validator if validation is enabled
    if (this.options.enableValidation) {
      this.initializeValidator();
    }
  }

  /**
   * Lazily loads class-validator for hybrid integration
   */
  private async initializeValidator(): Promise<void> {
    try {
      this.validator = await import("class-validator");
    } catch {
      console.warn(
        "[@sevirial/nest-mapper] class-validator not found. Validation will be skipped."
      );
    }
  }

  /**
   * Maps a source object to a target DTO
   */
  map<TSource, TTarget>(
    source: TSource,
    targetType: Constructor<TTarget>,
    options?: MapOptions<TTarget>
  ): TTarget {
    return Mapper.map(source, targetType, options);
  }

  /**
   * Maps an array of source objects to target DTOs
   */
  mapArray<TSource, TTarget>(
    sources: TSource[],
    targetType: Constructor<TTarget>,
    options?: MapOptions<TTarget>
  ): TTarget[] {
    return Mapper.mapArray(sources, targetType, options);
  }

  /**
   * Maps and validates the result using class-validator (if enabled)
   *
   * @throws ValidationError[] if validation fails
   */
  async mapAndValidate<TSource, TTarget extends object>(
    source: TSource,
    targetType: Constructor<TTarget>,
    options?: MapOptions<TTarget>
  ): Promise<TTarget> {
    const result = this.map(source, targetType, options);

    if (this.validator && this.options.enableValidation) {
      const errors = await this.validator.validate(result);
      if (errors.length > 0) {
        throw errors;
      }
    }

    return result;
  }

  /**
   * Pick specific fields (shorthand)
   */
  pick<TSource, TTarget, K extends keyof TTarget>(
    source: TSource,
    targetType: Constructor<TTarget>,
    fields: K[]
  ): Pick<TTarget, K> {
    return Mapper.pick(source, targetType, fields);
  }

  /**
   * Omit specific fields (shorthand)
   */
  omit<TSource, TTarget, K extends keyof TTarget>(
    source: TSource,
    targetType: Constructor<TTarget>,
    fields: K[]
  ): Omit<TTarget, K> {
    return Mapper.omit(source, targetType, fields);
  }

  /**
   * Use a field group (shorthand)
   */
  group<TSource, TTarget>(
    source: TSource,
    targetType: Constructor<TTarget>,
    groupName: string
  ): Partial<TTarget> {
    return Mapper.group(source, targetType, groupName);
  }

  /**
   * Creates a reusable mapper function
   */
  createMapper<TSource, TTarget>(
    targetType: Constructor<TTarget>,
    options?: MapOptions<TTarget>
  ): (source: TSource) => TTarget {
    return Mapper.createMapper(targetType, options);
  }
}
