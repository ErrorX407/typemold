/**
 * typeblend - Benchmark harness
 *
 * Run with: npm run benchmark
 *
 * These numbers are machine-dependent. The goal is to give a reproducible way
 * to measure typeblend on YOUR hardware rather than to assert absolute figures.
 */

import "reflect-metadata";
import { AutoMap, MapFrom, Mapper } from "../src";

class UserDto {
  @AutoMap()
  username!: string;

  @MapFrom("profile.avatarUrl")
  avatar!: string;

  @MapFrom<{ age: number }>((src) => src.age >= 18)
  isAdult!: boolean;

  @AutoMap()
  email!: string;
}

const makeUser = (i: number) => ({
  username: `user_${i}`,
  email: `user_${i}@example.com`,
  age: 18 + (i % 40),
  profile: { avatarUrl: `https://cdn/${i}.jpg`, coverUrl: `https://cdn/${i}-c.jpg` },
});

function time(label: string, iterations: number, fn: () => void): void {
  // Warm up (compile + JIT)
  for (let i = 0; i < 1000; i++) fn();

  const start = process.hrtime.bigint();
  for (let i = 0; i < iterations; i++) fn();
  const end = process.hrtime.bigint();

  const totalMs = Number(end - start) / 1e6;
  const perOpUs = (totalMs * 1000) / iterations;
  console.log(
    `${label.padEnd(28)} ${iterations.toLocaleString()} ops  ` +
      `total ${totalMs.toFixed(2)}ms  per-op ${perOpUs.toFixed(4)}µs`,
  );
}

function run(): void {
  console.log("typeblend benchmarks (results are machine-dependent)\n");

  const single = makeUser(1);
  time("single map()", 1_000_000, () => {
    Mapper.map(single, UserDto);
  });

  const batch = Array.from({ length: 1000 }, (_, i) => makeUser(i));
  time("mapArray() x1000 elements", 1_000, () => {
    Mapper.mapArray(batch, UserDto);
  });

  const reusable = Mapper.createMapper<ReturnType<typeof makeUser>, UserDto>(
    UserDto,
  );
  time("createMapper() reused", 1_000_000, () => {
    reusable(single);
  });

  console.log("\nDone.");
}

run();
