/**
 * tremap - NestJS MapperService Tests (Sprint 3)
 */

import "reflect-metadata";
import { AutoMap, MapFrom, MappingRegistry } from "../src";
import {
  MapperService,
  MappingValidationError,
} from "../src/nestjs/mapper.service";

class UserDto {
  @AutoMap()
  username!: string;

  @MapFrom((src: any) => src.tenant)
  tenant!: string;
}

const source = { username: "john", tenant: "from-source" };

describe("MapperService (Sprint 3)", () => {
  beforeEach(() => MappingRegistry.clearCache());

  it("maps without touching global Mapper state", () => {
    const service = new MapperService();
    const result = service.map(source, UserDto);
    expect(result.username).toBe("john");
  });

  describe("state isolation (F9)", () => {
    class ExtrasDto {
      @MapFrom((_src: any, ctx?: any) => ctx?.extras?.marker)
      marker!: string;
    }

    it("keeps globalExtras isolated between two service instances", () => {
      const a = new MapperService({ globalExtras: { marker: "A" } });
      const b = new MapperService({ globalExtras: { marker: "B" } });

      expect(a.map({}, ExtrasDto).marker).toBe("A");
      expect(b.map({}, ExtrasDto).marker).toBe("B");
      // constructing b must not have leaked into a
      expect(a.map({}, ExtrasDto).marker).toBe("A");
    });

    it("applies per-instance converters without global leakage", () => {
      class DateDto {
        @AutoMap()
        when!: string;
      }
      const withConv = new MapperService({
        converters: [
          {
            sourceType: Date,
            targetType: String,
            convert: (d: Date) => d.toISOString(),
          },
        ],
      });
      const without = new MapperService();

      const iso = new Date("2024-01-01T00:00:00.000Z");
      expect(withConv.map({ when: iso }, DateDto).when).toBe(
        "2024-01-01T00:00:00.000Z",
      );
      // the plain service has no converter -> value passes through untouched
      expect(without.map({ when: iso }, DateDto).when).toBeInstanceOf(Date);
    });
  });

  describe("validation (F8, F10)", () => {
    it("runs validation deterministically and throws a typed error", async () => {
      const fakeValidator = {
        validate: jest.fn().mockResolvedValue([{ property: "username" }]),
      };
      const service = new MapperService({ enableValidation: true });
      // inject a resolved validator so the test doesn't depend on install order
      (service as any).validatorPromise = Promise.resolve(fakeValidator);

      await expect(service.mapAndValidate(source, UserDto)).rejects.toBeInstanceOf(
        MappingValidationError,
      );
      expect(fakeValidator.validate).toHaveBeenCalled();
    });

    it("returns the mapped object when validation passes", async () => {
      const fakeValidator = { validate: jest.fn().mockResolvedValue([]) };
      const service = new MapperService({ enableValidation: true });
      (service as any).validatorPromise = Promise.resolve(fakeValidator);

      const result = await service.mapAndValidate(source, UserDto);
      expect(result.username).toBe("john");
    });

    it("MappingValidationError carries the underlying errors", () => {
      const err = new MappingValidationError([{ property: "x" }]);
      expect(err).toBeInstanceOf(Error);
      expect(err.errors).toHaveLength(1);
    });
  });
});
