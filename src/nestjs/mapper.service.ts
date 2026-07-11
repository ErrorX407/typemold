/**
 * typeblend - NestJS MapperService
 * Injectable service for NestJS dependency injection
 */

import { Injectable, Inject, Optional } from "@nestjs/common";
import { MapperFactory } from "../registry";
import {
  Constructor,
  MapOptions,
  MappingContext,
  TypeConverter,
} from "../types";

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
 * Thrown by {@link MapperService.mapAndValidate} when class-validator reports
 * one or more validation errors. A proper Error subclass (not a raw array) so
 * NestJS exception filters and stack traces behave correctly.
 */
export class MappingValidationError extends Error {
  constructor(public readonly errors: unknown[]) {
    super(`typeblend: mapped object failed validation (${errors.length} error(s))`);
    this.name = "MappingValidationError";
    // Restore prototype chain for instanceof across transpile targets.
    Object.setPrototypeOf(this, MappingValidationError.prototype);
  }
}

type ClassValidator = {
  validate: (obj: object) => Promise<unknown[]>;
};

/**
 * Injectable mapper service for NestJS.
 *
 * Unlike the static {@link Mapper}, this service keeps its converters and
 * global extras on the INSTANCE — it never mutates process-global state, so
 * two independently-constructed services stay fully isolated.
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
  private readonly converters: TypeConverter[];
  private readonly globalExtras: Record<string, unknown>;
  private validatorPromise?: Promise<ClassValidator | null>;

  constructor(
    @Optional() @Inject(MAPPER_OPTIONS) options?: MapperServiceOptions,
  ) {
    this.options = options || {};
    // Per-instance state — no mutation of the static Mapper singleton.
    this.converters = this.options.converters
      ? [...this.options.converters]
      : [];
    this.globalExtras = this.options.globalExtras
      ? { ...this.options.globalExtras }
      : {};
  }

  /**
   * Builds a fresh mapping context per call (instance converters + extras,
   * plus cycle-detection state).
   */
  private buildContext<TTarget>(
    options?: MapOptions<TTarget>,
  ): MappingContext {
    return {
      extras: { ...this.globalExtras, ...options?.extras },
      depth: 0,
      visited: new WeakMap(),
      converters: this.converters,
    };
  }

  /**
   * Lazily loads class-validator exactly once, awaited (never fire-and-forget).
   * Returns null if the optional dependency is not installed.
   */
  private loadValidator(): Promise<ClassValidator | null> {
    if (!this.validatorPromise) {
      this.validatorPromise = import("class-validator")
        .then((m) => ({ validate: m.validate }) as ClassValidator)
        .catch(() => {
          console.warn(
            "[typeblend] class-validator not found. Validation will be skipped.",
          );
          return null;
        });
    }
    return this.validatorPromise;
  }

  /**
   * Maps a source object to a target DTO
   */
  map<TSource, TTarget>(
    source: TSource,
    targetType: Constructor<TTarget>,
    options?: MapOptions<TTarget>,
  ): TTarget {
    if (source == null) {
      return null as unknown as TTarget;
    }
    const mapper = MapperFactory.createMapper<TSource, TTarget>(
      targetType,
      options,
    );
    return mapper(source, this.buildContext(options));
  }

  /**
   * Maps an array of source objects to target DTOs
   */
  mapArray<TSource, TTarget>(
    sources: TSource[],
    targetType: Constructor<TTarget>,
    options?: MapOptions<TTarget>,
  ): TTarget[] {
    if (!sources || !Array.isArray(sources)) {
      return [];
    }
    const mapper = MapperFactory.createMapper<TSource, TTarget>(
      targetType,
      options,
    );
    const result: TTarget[] = new Array(sources.length);
    for (let i = 0; i < sources.length; i++) {
      result[i] =
        sources[i] != null
          ? mapper(sources[i], this.buildContext(options))
          : (null as unknown as TTarget);
    }
    return result;
  }

  /**
   * Maps and validates the result using class-validator (if enabled).
   * Validation is deterministic: the validator load is awaited here, so it is
   * never silently skipped due to an unresolved import.
   *
   * @throws {MappingValidationError} if validation fails
   */
  async mapAndValidate<TSource, TTarget extends object>(
    source: TSource,
    targetType: Constructor<TTarget>,
    options?: MapOptions<TTarget>,
  ): Promise<TTarget> {
    const result = this.map(source, targetType, options);

    if (this.options.enableValidation && result != null) {
      const validator = await this.loadValidator();
      if (validator) {
        const errors = await validator.validate(result as object);
        if (errors.length > 0) {
          throw new MappingValidationError(errors);
        }
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
    fields: K[],
  ): Pick<TTarget, K> {
    return this.map(source, targetType, {
      pick: fields as (keyof TTarget)[],
    }) as Pick<TTarget, K>;
  }

  /**
   * Omit specific fields (shorthand)
   */
  omit<TSource, TTarget, K extends keyof TTarget>(
    source: TSource,
    targetType: Constructor<TTarget>,
    fields: K[],
  ): Omit<TTarget, K> {
    return this.map(source, targetType, {
      omit: fields as (keyof TTarget)[],
    }) as Omit<TTarget, K>;
  }

  /**
   * Use a field group (shorthand)
   */
  group<TSource, TTarget>(
    source: TSource,
    targetType: Constructor<TTarget>,
    groupName: string,
  ): Partial<TTarget> {
    return this.map(source, targetType, { group: groupName });
  }

  /**
   * Creates a reusable mapper function. A fresh context is built per call so
   * cycle-detection state is never shared across invocations.
   */
  createMapper<TSource, TTarget>(
    targetType: Constructor<TTarget>,
    options?: MapOptions<TTarget>,
  ): (source: TSource) => TTarget {
    const mapper = MapperFactory.createMapper<TSource, TTarget>(
      targetType,
      options,
    );
    return (source: TSource) =>
      source == null
        ? (null as unknown as TTarget)
        : mapper(source, this.buildContext(options));
  }
}
