/**
 * @sevirial/nest-mapper - NestJS MapperModule
 * Dynamic module for NestJS integration
 */

import {
  DynamicModule,
  Module,
  Provider,
  Type,
  InjectionToken,
  OptionalFactoryDependency,
} from "@nestjs/common";
import {
  MapperService,
  MapperServiceOptions,
  MAPPER_OPTIONS,
} from "./mapper.service";

/**
 * Module options for MapperModule.forRoot()
 */
export interface MapperModuleOptions extends MapperServiceOptions {
  /**
   * Make module global (available everywhere without importing)
   * @default true
   */
  isGlobal?: boolean;
}

/**
 * Async module options for MapperModule.forRootAsync()
 */
export interface MapperModuleAsyncOptions {
  /**
   * Make module global
   */
  isGlobal?: boolean;

  /**
   * Modules to import for dependency injection
   */
  imports?: Array<Type<unknown> | DynamicModule>;

  /**
   * Factory function to create options
   */
  useFactory: (
    ...args: unknown[]
  ) => Promise<MapperServiceOptions> | MapperServiceOptions;

  /**
   * Dependencies to inject into factory
   */
  inject?: Array<InjectionToken | OptionalFactoryDependency>;
}

/**
 * NestJS Module for @sevirial/nest-mapper
 *
 * @example
 * // Basic usage (global by default)
 * @Module({
 *   imports: [MapperModule.forRoot()],
 * })
 * export class AppModule {}
 *
 * @example
 * // With options
 * @Module({
 *   imports: [
 *     MapperModule.forRoot({
 *       enableValidation: true,
 *       converters: [myDateConverter],
 *     }),
 *   ],
 * })
 * export class AppModule {}
 *
 * @example
 * // Async configuration
 * @Module({
 *   imports: [
 *     MapperModule.forRootAsync({
 *       imports: [ConfigModule],
 *       useFactory: (config: ConfigService) => ({
 *         enableValidation: config.get('ENABLE_VALIDATION'),
 *       }),
 *       inject: [ConfigService],
 *     }),
 *   ],
 * })
 * export class AppModule {}
 */
@Module({})
export class MapperModule {
  /**
   * Configure the mapper module with static options
   */
  static forRoot(options?: MapperModuleOptions): DynamicModule {
    const isGlobal = options?.isGlobal ?? true;

    const optionsProvider: Provider = {
      provide: MAPPER_OPTIONS,
      useValue: options || {},
    };

    return {
      module: MapperModule,
      global: isGlobal,
      providers: [optionsProvider, MapperService],
      exports: [MapperService],
    };
  }

  /**
   * Configure the mapper module with async options (factory pattern)
   */
  static forRootAsync(options: MapperModuleAsyncOptions): DynamicModule {
    const isGlobal = options.isGlobal ?? true;

    const asyncOptionsProvider: Provider = {
      provide: MAPPER_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };

    return {
      module: MapperModule,
      global: isGlobal,
      imports: options.imports || [],
      providers: [asyncOptionsProvider, MapperService],
      exports: [MapperService],
    };
  }

  /**
   * For feature modules that need the mapper (when not using isGlobal)
   */
  static forFeature(): DynamicModule {
    return {
      module: MapperModule,
      providers: [MapperService],
      exports: [MapperService],
    };
  }
}
