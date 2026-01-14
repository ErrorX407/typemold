/**
 * typemold - Node.js Quickstart Example
 *
 * Run: npx ts-node examples/node-quickstart.ts
 */

import "reflect-metadata";
import { Mapper, AutoMap, MapFrom, FieldGroup, Groups } from "typemold";

// Define your DTO with decorators
class UserDto {
  @FieldGroup(Groups.MINIMAL, Groups.PUBLIC)
  @AutoMap()
  username!: string;

  @FieldGroup(Groups.MINIMAL, Groups.PUBLIC)
  @MapFrom("profile.avatarUrl")
  avatar!: string;

  @FieldGroup(Groups.PUBLIC)
  @AutoMap()
  bio!: string;

  @MapFrom((src: any) => src.age >= 18)
  isAdult!: boolean;

  @FieldGroup(Groups.FULL)
  @AutoMap()
  email!: string;
}

// Source entity (from database, API, etc.)
const userEntity = {
  username: "john_doe",
  email: "john@example.com",
  age: 25,
  bio: "Software developer",
  profile: {
    avatarUrl: "https://example.com/avatar.jpg",
  },
};

console.log("=== typemold Node.js Examples ===\n");

// 1. Full mapping
console.log("1. Full mapping:");
const fullDto = Mapper.map(userEntity, UserDto);
console.log(fullDto);
console.log();

// 2. Field groups
console.log("2. Minimal group (username, avatar):");
const minimal = Mapper.group(userEntity, UserDto, Groups.MINIMAL);
console.log(minimal);
console.log();

console.log("3. Public group (username, avatar, bio):");
const publicProfile = Mapper.group(userEntity, UserDto, Groups.PUBLIC);
console.log(publicProfile);
console.log();

// 3. Pick specific fields
console.log("4. Pick only username and isAdult:");
const picked = Mapper.pick(userEntity, UserDto, ["username", "isAdult"]);
console.log(picked);
console.log();

// 4. Omit sensitive fields
console.log("5. Omit email:");
const noEmail = Mapper.omit(userEntity, UserDto, ["email"]);
console.log(noEmail);
console.log();

// 5. Array mapping
console.log("6. Array mapping:");
const users = [userEntity, { ...userEntity, username: "jane_doe", age: 17 }];
const dtos = Mapper.mapArray(users, UserDto);
console.log(dtos);
console.log();

// 6. Create reusable mapper
console.log("7. Reusable mapper:");
const mapToUser = Mapper.createMapper(UserDto);
console.log(mapToUser(userEntity));
