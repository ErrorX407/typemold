# tmapper

A **lightweight**, **high-performance** object mapper for TypeScript & Node.js with runtime field projection.

[![npm version](https://img.shields.io/npm/v/tmapper.svg)](https://www.npmjs.com/package/tmapper)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Downloads](https://img.shields.io/npm/dm/tmapper.svg)](https://www.npmjs.com/package/tmapper)

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
npm install tmapper reflect-metadata
```

```typescript
// Usage
import { Mapper, AutoMap, MapFrom } from "tmapper";
```

---

### NestJS

```bash
npm install tmapper reflect-metadata
```

```typescript
// Core decorators & Mapper
import { Mapper, AutoMap, MapFrom } from "tmapper";

// NestJS module & service (separate subpath)
import { MapperModule, MapperService } from "tmapper/nestjs";
```

> **Note:** NestJS integration requires `@nestjs/common` and `@nestjs/core` (usually already installed in NestJS projects).

---

## 🚀 Quick Start

### 1. Define Your DTO

```typescript
import { AutoMap, MapFrom, FieldGroup } from "tmapper";

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
import { Mapper } from "tmapper";

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

> Import from `tmapper/nestjs`

### Setup

```typescript
import { Module } from "@nestjs/common";
import { MapperModule } from "tmapper/nestjs";

@Module({
  imports: [MapperModule.forRoot()],
})
export class AppModule {}
```

### Using MapperService

```typescript
import { Injectable } from "@nestjs/common";
import { MapperService } from "tmapper/nestjs";

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

| Operation    | tmapper    | @automapper/nestjs | Manual   |
| ------------ | ---------- | ------------------ | -------- |
| Single map   | ~0.002ms   | ~0.05ms            | ~0.001ms |
| Array (1000) | ~1.5ms     | ~40ms              | ~1ms     |
| Memory       | O(1) cache | O(n) profiles      | None     |

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
