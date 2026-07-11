# typeblend

A **lightweight**, **high-performance** object mapper for TypeScript & Node.js with runtime field projection.

[![npm version](https://img.shields.io/npm/v/typeblend.svg)](https://www.npmjs.com/package/typeblend)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Downloads](https://img.shields.io/npm/dm/typeblend.svg)](https://www.npmjs.com/package/typeblend)

## Features

- ⚡ **High Performance** - Compiled mappers cached after first use (no runtime reflection)
- 🎯 **Runtime Field Projection** - Pick/omit fields without creating multiple DTOs
- 📦 **Lightweight** - ~3KB gzipped, zero runtime dependencies
- 🏷️ **Field Groups** - Define reusable field sets with decorators
- 🔧 **NestJS Integration** - Full module support with DI (separate import)
- ✅ **TypeScript First** - Full strict mode support
- 🔄 **Hybrid Validation** - Optional class-validator integration

---

## 📦 Installation

### Node.js / Express / Fastify

```bash
npm install typeblend reflect-metadata
```

```typescript
// Usage
import { Mapper, AutoMap, MapFrom } from "typeblend";
```

---

### NestJS

```bash
npm install typeblend reflect-metadata
```

```typescript
// Core decorators & Mapper
import { Mapper, AutoMap, MapFrom } from "typeblend";

// NestJS module & service (separate subpath)
import { MapperModule, MapperService } from "typeblend/nestjs";
```

> **Note:** NestJS integration requires `@nestjs/common` and `@nestjs/core` (usually already installed in NestJS projects).

---

## 🚀 Quick Start

### 1. Define Your DTO

```typescript
import { AutoMap, MapFrom, FieldGroup } from "typeblend";

class UserDto {
  @AutoMap()
  username: string;

  @MapFrom("profile.avatar")
  avatarUrl: string;

  @MapFrom((src) => src.age >= 18)
  isAdult: boolean;

  @AutoMap()
  email: string;
}
```

### 2. Map Objects

```typescript
import { Mapper } from "typeblend";

// Basic mapping
const userDto = Mapper.map(userEntity, UserDto);

// Array mapping
const userDtos = Mapper.mapArray(users, UserDto);
```

---

## ⭐ Runtime Field Projection

**The killer feature** - reuse a single DTO across multiple endpoints:

```typescript
// Full user profile
Mapper.map(user, UserDto);
// Result: { username, avatarUrl, isAdult, email }

// Only username and avatar
Mapper.pick(user, UserDto, ["username", "avatarUrl"]);
// Result: { username, avatarUrl }

// Exclude sensitive fields
Mapper.omit(user, UserDto, ["email"]);
// Result: { username, avatarUrl, isAdult }

// Using options object
Mapper.map(user, UserDto, { pick: ["username", "avatarUrl"] });
Mapper.map(user, UserDto, { omit: ["email"] });
```

---

## 🏷️ Field Groups

Define reusable field sets:

```typescript
class UserDto {
  @FieldGroup("minimal", "public")
  @AutoMap()
  username: string;

  @FieldGroup("minimal", "public")
  @MapFrom("profile.avatar")
  avatar: string;

  @FieldGroup("public", "full")
  @AutoMap()
  bio: string;

  @FieldGroup("full")
  @AutoMap()
  email: string;
}

// Use field groups
Mapper.group(user, UserDto, "minimal"); // { username, avatar }
Mapper.group(user, UserDto, "public"); // { username, avatar, bio }
Mapper.group(user, UserDto, "full"); // { bio, email }
```

---

## 🧩 Nested Mapping

Map nested objects (and arrays of them) into their own DTOs with `@NestedType`:

```typescript
class AddressDto {
  @AutoMap() city: string;
  @AutoMap() zip: string;
}

class CompanyDto {
  @AutoMap() name: string;

  @NestedType(() => AddressDto)
  @MapFrom("address")
  address: AddressDto; // deep-mapped into AddressDto

  @NestedType(() => AddressDto)
  @MapFrom("locations")
  locations: AddressDto[]; // arrays are mapped element-wise
}
```

Circular references are handled automatically (a revisited source resolves to the
same mapped instance), with a safety ceiling on recursion depth.

---

## 🔁 Type Converters

Register a converter to transform values by runtime type during mapping:

```typescript
Mapper.registerConverter({
  sourceType: Date,
  targetType: String,
  convert: (d: Date) => d.toISOString(),
});
```

**Precedence:** explicit `@MapFrom` transform → registered converter → raw value.

> In NestJS, pass converters via `MapperModule.forRoot({ converters: [...] })` —
> they are held **per-service instance**, never on global state.

---

## 🎛️ Projection precedence

When multiple projection options are provided, they resolve in this order:
**`group` → `pick` → `omit`**. Note: `pick: []` selects **no** fields, while
`omit: []` selects **all** fields.

---

## 🎨 Decorators

| Decorator                 | Description                  | Example                                          |
| ------------------------- | ---------------------------- | ------------------------------------------------ |
| `@AutoMap()`              | Maps property with same name | `@AutoMap() name: string`                        |
| `@MapFrom(path)`          | Maps from nested path        | `@MapFrom('profile.avatar') avatar: string`      |
| `@MapFrom(fn)`            | Custom transform             | `@MapFrom(src => src.age > 18) isAdult: boolean` |
| `@FieldGroup(...groups)`  | Assigns to field groups      | `@FieldGroup('minimal', 'public')`               |
| `@Ignore()`               | Skips property               | `@Ignore() internalId: string`                   |
| `@NestedType(() => Type)` | Nested object mapping        | `@NestedType(() => AddressDto)`                  |

---

## 🔧 NestJS Integration

> Import from `typeblend/nestjs`

### Setup

```typescript
import { Module } from "@nestjs/common";
import { MapperModule } from "typeblend/nestjs";

@Module({
  imports: [MapperModule.forRoot()],
})
export class AppModule {}
```

### Using MapperService

```typescript
import { Injectable } from "@nestjs/common";
import { MapperService } from "typeblend/nestjs";

@Injectable()
export class UserService {
  constructor(private readonly mapper: MapperService) {}

  async getUser(id: string): Promise<UserDto> {
    const user = await this.userRepo.findOne(id);
    return this.mapper.map(user, UserDto);
  }

  async getUserMinimal(id: string) {
    const user = await this.userRepo.findOne(id);
    return this.mapper.group(user, UserDto, "minimal");
  }
}
```

### Async Configuration

```typescript
MapperModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (config: ConfigService) => ({
    enableValidation: config.get("ENABLE_VALIDATION"),
  }),
  inject: [ConfigService],
});
```

---

## ⚡ Performance

typeblend compiles a mapper once per (DTO, projection) and caches it, so per-object
mapping avoids runtime reflection. Exact numbers are hardware-dependent — run the
included harness on your own machine:

```bash
npm run benchmark
```

Indicative results (Node 20, Apple Silicon, sub-microsecond per single map;
a 1000-element `mapArray` in well under a millisecond). The compiled-mapper cache
is `O(1)` per (type, projection) — see [`benchmarks/index.ts`](./benchmarks/index.ts)
to reproduce.

---

## 📚 API Reference

### Mapper (Static)

```typescript
Mapper.map(source, TargetDto, options?)
Mapper.mapArray(sources, TargetDto, options?)
Mapper.pick(source, TargetDto, ['field1', 'field2'])
Mapper.omit(source, TargetDto, ['field1'])
Mapper.group(source, TargetDto, 'groupName')
Mapper.createMapper(TargetDto, options?)
```

### MapOptions

```typescript
interface MapOptions<T> {
  pick?: (keyof T)[]; // Include only these fields
  omit?: (keyof T)[]; // Exclude these fields
  group?: string; // Use predefined field group
  extras?: Record<string, unknown>; // Extra context for transforms
}
```

---

## License

MIT © [Chetan Joshi](https://github.com/ErrorX407)
