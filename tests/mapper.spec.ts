/**
 * typeblend - Core Mapper Tests
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
  NestedType,
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
        UserDto,
      );

      const result1 = mapToUserDto(userEntity);
      const result2 = mapToUserDto({ ...userEntity, username: "test" });

      expect(result1.username).toBe("john_doe");
      expect(result2.username).toBe("test");
    });
  });

  describe("Sprint 1 — correctness fixes", () => {
    it("clearCache() recompiles mappers (F4)", () => {
      Mapper.map(userEntity, UserDto);
      const before = Mapper.getCompiledMapper(UserDto);
      expect(before).toBeDefined();

      Mapper.clearCache();
      // After a real clear, the compiled mapper must be gone...
      expect(Mapper.getCompiledMapper(UserDto)).toBeUndefined();

      // ...and a subsequent map must build a fresh (different) instance.
      Mapper.map(userEntity, UserDto);
      const after = Mapper.getCompiledMapper(UserDto);
      expect(after).toBeDefined();
      expect(after).not.toBe(before);
    });

    it("does not mutate the caller's pick array (F5)", () => {
      const fields = ["email", "avatar", "username"] as (keyof UserDto)[];
      const snapshot = [...fields];
      Mapper.map(userEntity, UserDto, { pick: fields });
      expect(fields).toEqual(snapshot); // order preserved, not sorted in place
    });

    it("does not collide on comma-containing field names (F6)", () => {
      const k1 = MappingRegistry.getOptionsKey({ pick: ["a", "b"] as any });
      const k2 = MappingRegistry.getOptionsKey({ pick: ["a,b"] as any });
      expect(k1).not.toBe(k2);
    });

    it("pick: [] returns no fields (F7)", () => {
      const result = Mapper.map(userEntity, UserDto, { pick: [] });
      expect(Object.keys(result)).toHaveLength(0);
    });

    it("omit: [] returns all fields (F7)", () => {
      const full = Mapper.map(userEntity, UserDto);
      const result = Mapper.map(userEntity, UserDto, { omit: [] });
      expect(Object.keys(result).sort()).toEqual(Object.keys(full).sort());
    });

    it("group takes precedence over pick/omit (F6)", () => {
      const result = Mapper.map(userEntity, UserWithGroupsDto, {
        group: "minimal",
        pick: ["email"] as any,
        omit: ["username"] as any,
      });
      expect(result.username).toBe("john_doe");
      expect(result.email).toBeUndefined();
    });
  });

  describe("Sprint 2 — nested mapping (F1)", () => {
    class AddressDto {
      @AutoMap()
      city!: string;
      @AutoMap()
      zip!: string;
    }

    class CompanyDto {
      @AutoMap()
      name!: string;

      @NestedType(() => AddressDto)
      @MapFrom("address")
      address!: AddressDto;
    }

    class TeamDto {
      @AutoMap()
      title!: string;

      @NestedType(() => AddressDto)
      @MapFrom("locations")
      locations!: AddressDto[];
    }

    it("maps a single nested object into its DTO type", () => {
      const src = {
        name: "Acme",
        address: { city: "Pune", zip: "411001", secret: "x" },
      };
      const result = Mapper.map(src, CompanyDto);
      expect(result.address).toBeInstanceOf(AddressDto);
      expect(result.address.city).toBe("Pune");
      expect(result.address.zip).toBe("411001");
      // fields not on the nested DTO are dropped
      expect((result.address as any).secret).toBeUndefined();
    });

    it("maps arrays of nested objects element-wise", () => {
      const src = {
        title: "Eng",
        locations: [
          { city: "Pune", zip: "1" },
          { city: "Delhi", zip: "2" },
        ],
      };
      const result = Mapper.map(src, TeamDto);
      expect(result.locations).toHaveLength(2);
      expect(result.locations[0]).toBeInstanceOf(AddressDto);
      expect(result.locations[1].city).toBe("Delhi");
    });

    it("passes null/undefined nested values through safely", () => {
      const result = Mapper.map({ name: "Acme", address: null }, CompanyDto);
      expect(result.address).toBeNull();
    });
  });

  describe("Sprint 2 — circular references (F3)", () => {
    class NodeDto {
      @AutoMap()
      id!: number;

      @NestedType(() => NodeDto)
      @MapFrom("next")
      next!: NodeDto;
    }

    it("does not stack-overflow on a self-referential source", () => {
      const a: any = { id: 1 };
      const b: any = { id: 2, next: a };
      a.next = b; // cycle a -> b -> a

      const result = Mapper.map(a, NodeDto);
      expect(result.id).toBe(1);
      expect(result.next.id).toBe(2);
      // the cycle resolves back to the same mapped instance
      expect(result.next.next).toBe(result);
    });
  });

  describe("Sprint 2 — type converters (F2)", () => {
    class EventDto {
      @AutoMap()
      when!: string;
    }

    afterEach(() => {
      // converters live on the static Mapper; reset via re-import isn't trivial,
      // so we rely on distinct runtime types per test to avoid interference.
    });

    it("applies a registered converter to path-mapped values", () => {
      Mapper.registerConverter({
        sourceType: Date,
        targetType: String,
        convert: (d: Date) => d.toISOString(),
      });

      const iso = new Date("2024-01-01T00:00:00.000Z");
      const result = Mapper.map({ when: iso }, EventDto);
      expect(result.when).toBe("2024-01-01T00:00:00.000Z");
    });
  });

  describe("Sprint 4 — edge cases & security guards", () => {
    it("returns undefined for missing nested paths (no throw)", () => {
      const result = Mapper.map({ username: "x" }, UserDto);
      expect(result.avatar).toBeUndefined();
    });

    it("handles null nested containers without throwing", () => {
      const result = Mapper.map({ username: "x", profile: null }, UserDto);
      expect(result.avatar).toBeUndefined();
    });

    it("blocks prototype-pollution via mapped paths", () => {
      class EvilDto {
        @MapFrom("__proto__.polluted")
        x!: unknown;
      }
      const src = JSON.parse('{"a":1}');
      Mapper.map(src, EvilDto);
      // global Object prototype must remain clean
      expect(({} as any).polluted).toBeUndefined();
    });

    it("mapArray skips null elements, keeping positions", () => {
      const result = Mapper.mapArray(
        [userEntity, null as any, userEntity],
        UserDto,
      );
      expect(result).toHaveLength(3);
      expect(result[0].username).toBe("john_doe");
      expect(result[1]).toBeNull();
      expect(result[2].username).toBe("john_doe");
    });

    it("returns null (not throw) for a null single source", () => {
      expect(Mapper.map(null, UserDto)).toBeNull();
      expect(Mapper.map(undefined as any, UserDto)).toBeNull();
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
