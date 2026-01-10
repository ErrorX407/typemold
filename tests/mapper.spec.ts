/**
 * @sevirial/nest-mapper - Core Mapper Tests
 */

import "reflect-metadata";
import {
  AutoMap,
  FieldGroup,
  Groups,
  Ignore,
  MapFrom,
  Mapper,
  MappingRegistry,
  createMapping,
} from "../src";

// Source entity interface (for IntelliSense demo)
interface UserEntity {
  username: string;
  email: string;
  age: number;
  bio: string;
  createdAt: Date;
  profile: {
    avatarUrl: string;
    coverUrl: string;
  };
}

// Test DTOs - Using MapFrom<T> for IntelliSense on transform functions
class UserDto {
  @AutoMap()
  username!: string;

  // String paths work but don't have autocomplete (TypeScript limitation)
  @MapFrom("profile.avatarUrl")
  avatar!: string;

  // Transform function with generic gets full IntelliSense on `src` ✨
  @MapFrom<UserEntity>((src) => src.age >= 18)
  isAdult!: boolean;

  @AutoMap()
  email!: string;
}

// Using built-in Groups constant - autocomplete works out of the box! ✨
class UserWithGroupsDto {
  @FieldGroup(Groups.MINIMAL, Groups.PUBLIC) // ✨ Autocomplete!
  @AutoMap()
  username!: string;

  @FieldGroup(Groups.MINIMAL, Groups.PUBLIC)
  @MapFrom("profile.avatarUrl")
  avatar!: string;

  @FieldGroup(Groups.PUBLIC, Groups.FULL)
  @AutoMap()
  bio!: string;

  @FieldGroup(Groups.FULL)
  @AutoMap()
  email!: string;

  @FieldGroup(Groups.FULL)
  @AutoMap()
  createdAt!: Date;
}

class IgnoreTestDto {
  @AutoMap()
  name!: string;

  @Ignore()
  secret!: string;
}

// Source data
const userEntity = {
  username: "john_doe",
  email: "john@example.com",
  age: 25,
  bio: "Software developer",
  createdAt: new Date("2024-01-01"),
  profile: {
    avatarUrl: "https://example.com/avatar.jpg",
    coverUrl: "https://example.com/cover.jpg",
  },
};

describe("Mapper", () => {
  beforeEach(() => {
    MappingRegistry.clearCache();
  });

  describe("Basic Mapping", () => {
    it("should map properties with @AutoMap()", () => {
      const result = Mapper.map(userEntity, UserDto);

      expect(result.username).toBe("john_doe");
      expect(result.email).toBe("john@example.com");
    });

    it("should map nested paths with @MapFrom()", () => {
      const result = Mapper.map(userEntity, UserDto);

      expect(result.avatar).toBe("https://example.com/avatar.jpg");
    });

    it("should transform values with custom function", () => {
      const result = Mapper.map(userEntity, UserDto);

      expect(result.isAdult).toBe(true);
    });

    it("should return null for null source", () => {
      const result = Mapper.map(null, UserDto);

      expect(result).toBeNull();
    });
  });

  describe("Array Mapping", () => {
    it("should map arrays of objects", () => {
      const users = [userEntity, { ...userEntity, username: "jane_doe" }];
      const result = Mapper.mapArray(users, UserDto);

      expect(result).toHaveLength(2);
      expect(result[0].username).toBe("john_doe");
      expect(result[1].username).toBe("jane_doe");
    });

    it("should return empty array for null input", () => {
      const result = Mapper.mapArray(null as any, UserDto);

      expect(result).toEqual([]);
    });
  });

  describe("Field Projection - Pick", () => {
    it("should pick only specified fields", () => {
      const result = Mapper.map(userEntity, UserDto, {
        pick: ["username", "avatar"],
      });

      expect(result.username).toBe("john_doe");
      expect(result.avatar).toBe("https://example.com/avatar.jpg");
      expect(result.email).toBeUndefined();
      expect(result.isAdult).toBeUndefined();
    });

    it("should work with pick shorthand", () => {
      const result = Mapper.pick(userEntity, UserDto, ["username"]);

      expect(result.username).toBe("john_doe");
      expect((result as any).email).toBeUndefined();
    });
  });

  describe("Field Projection - Omit", () => {
    it("should omit specified fields", () => {
      const result = Mapper.map(userEntity, UserDto, {
        omit: ["email", "isAdult"],
      });

      expect(result.username).toBe("john_doe");
      expect(result.avatar).toBe("https://example.com/avatar.jpg");
      expect(result.email).toBeUndefined();
      expect(result.isAdult).toBeUndefined();
    });

    it("should work with omit shorthand", () => {
      const result = Mapper.omit(userEntity, UserDto, ["email"]);

      expect(result.username).toBe("john_doe");
      expect((result as any).email).toBeUndefined();
    });
  });

  describe("Field Groups", () => {
    it('should only map fields in the "minimal" group', () => {
      const result = Mapper.map(userEntity, UserWithGroupsDto, {
        group: "minimal",
      });

      expect(result.username).toBe("john_doe");
      expect(result.avatar).toBe("https://example.com/avatar.jpg");
      expect(result.bio).toBeUndefined();
      expect(result.email).toBeUndefined();
    });

    it('should map fields in the "public" group', () => {
      const result = Mapper.map(userEntity, UserWithGroupsDto, {
        group: "public",
      });

      expect(result.username).toBe("john_doe");
      expect(result.avatar).toBe("https://example.com/avatar.jpg");
      expect(result.bio).toBe("Software developer");
      expect(result.email).toBeUndefined();
    });

    it('should map all fields in the "full" group', () => {
      const result = Mapper.map(userEntity, UserWithGroupsDto, {
        group: "full",
      });

      expect(result.bio).toBe("Software developer");
      expect(result.email).toBe("john@example.com");
      expect(result.createdAt).toEqual(new Date("2024-01-01"));
    });

    it("should work with group shorthand", () => {
      const result = Mapper.group(userEntity, UserWithGroupsDto, "minimal");

      expect(result.username).toBe("john_doe");
      expect(result.bio).toBeUndefined();
    });
  });

  describe("@Ignore decorator", () => {
    it("should skip ignored properties", () => {
      const source = { name: "Test", secret: "password123" };
      const result = Mapper.map(source, IgnoreTestDto);

      expect(result.name).toBe("Test");
      expect(result.secret).toBeUndefined();
    });
  });

  describe("Mapper Caching", () => {
    it("should cache compiled mappers", () => {
      // First call compiles the mapper
      Mapper.map(userEntity, UserDto);

      // Second call should use cached mapper
      const mapper1 = Mapper.getCompiledMapper(UserDto);
      const mapper2 = Mapper.getCompiledMapper(UserDto);

      expect(mapper1).toBe(mapper2);
    });

    it("should cache different mappers for different options", () => {
      Mapper.map(userEntity, UserDto, { pick: ["username"] });
      Mapper.map(userEntity, UserDto, { pick: ["email"] });

      const pickUsername = Mapper.getCompiledMapper(UserDto, {
        pick: ["username"] as any,
      });
      const pickEmail = Mapper.getCompiledMapper(UserDto, {
        pick: ["email"] as any,
      });

      expect(pickUsername).not.toBe(pickEmail);
    });
  });

  describe("createMapper factory", () => {
    it("should create a reusable mapper function", () => {
      const mapToUserDto = Mapper.createMapper<typeof userEntity, UserDto>(
        UserDto
      );

      const result1 = mapToUserDto(userEntity);
      const result2 = mapToUserDto({ ...userEntity, username: "test" });

      expect(result1.username).toBe("john_doe");
      expect(result2.username).toBe("test");
    });
  });

  describe("createMapping builder", () => {
    it("should create type-safe mappings with paths and transforms", () => {
      // This is the type-safe alternative that provides autocomplete!
      const toUserDto = createMapping<UserEntity, UserDto>({
        username: "username",
        avatar: "profile.avatarUrl",
        isAdult: (src) => src.age >= 18,
        email: "email",
      });

      const result = toUserDto(userEntity);

      expect(result.username).toBe("john_doe");
      expect(result.avatar).toBe("https://example.com/avatar.jpg");
      expect(result.isAdult).toBe(true);
      expect(result.email).toBe("john@example.com");
    });
  });
});
