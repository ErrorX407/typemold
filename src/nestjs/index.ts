/**
 * tremap - NestJS Integration
 * Re-exports for NestJS-specific functionality
 */

export {
  MapperModule,
  MapperModuleOptions,
  MapperModuleAsyncOptions,
} from "./mapper.module";
export {
  MapperService,
  MapperServiceOptions,
  MappingValidationError,
  MAPPER_OPTIONS,
} from "./mapper.service";
