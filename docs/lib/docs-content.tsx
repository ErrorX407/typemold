import * as React from "react";
import { Highlight, themes } from "prism-react-renderer";
import { CopyButton } from "@/components/copy-button";

export interface DocSection {
  title: string;
  slug: string;
  content: React.ReactNode;
}

const CodeBlock = ({ code, language = "typescript" }: { code: string; language?: string }) => (
  <div className="relative my-6 overflow-hidden rounded-xl border border-white/10 bg-[#0d0d0d] shadow-xl">
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-black/40">
      <div className="flex space-x-2">
        <div className="w-3 h-3 rounded-full bg-[#ff5f56]/50"></div>
        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]/50"></div>
        <div className="w-3 h-3 rounded-full bg-[#27c93f]/50"></div>
      </div>
      <span className="text-xs font-mono text-white/40 uppercase tracking-wider">{language}</span>
      <CopyButton value={code} className="text-white/40 hover:text-white" />
    </div>
    <div className="p-5 overflow-x-auto text-[14px] font-mono leading-loose">
      <Highlight theme={themes.vsDark} code={code.trim()} language={language as any}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={className} style={{ ...style, backgroundColor: 'transparent' }}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  </div>
);

export const docsData: DocSection[] = [
  {
    title: "Overview",
    slug: "",
    content: (
      <div className="space-y-6 text-white/80">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">tmapper</h1>
        <p className="text-lg md:text-xl leading-relaxed text-white/60">
          A lightweight, high-performance object mapper for TypeScript & Node.js, built from the ground up for speed and flexibility.
        </p>
        
        <p className="leading-relaxed">
          While most object mappers in the Node.js ecosystem rely heavily on runtime reflection—leading to significant performance bottlenecks in large applications—`tmapper` takes a different approach. It leverages decorators to statically define your schemas, and then compiles highly optimized mapping functions under the hood. 
        </p>
        
        <div className="grid gap-6 sm:grid-cols-2 mt-10">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors">
            <h3 className="font-semibold text-white mb-3 text-lg tracking-tight">⚡ Unmatched Performance</h3>
            <p className="text-white/60 leading-relaxed">Mappers are compiled and cached after their first use. This eliminates the O(n) reflection overhead entirely, achieving speeds of ~0.002ms per mapping operation.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors">
            <h3 className="font-semibold text-white mb-3 text-lg tracking-tight">🎯 Runtime Projection</h3>
            <p className="text-white/60 leading-relaxed">Instead of creating ten different DTOs (e.g. `CreateUser`, `UpdateUser`, `PublicUser`), dynamically pick or omit fields at runtime safely.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors">
            <h3 className="font-semibold text-white mb-3 text-lg tracking-tight">📦 Extremely Lightweight</h3>
            <p className="text-white/60 leading-relaxed">Clocking in at roughly ~3KB gzipped, tmapper has absolutely zero runtime dependencies other than the standard `reflect-metadata` required by TypeScript.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors">
            <h3 className="font-semibold text-white mb-3 text-lg tracking-tight">🏷️ Robust Field Groups</h3>
            <p className="text-white/60 leading-relaxed">Assign properties to semantic groups directly in your DTO, allowing you to easily serialize specific sets of data for different access levels.</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Usage: Vanilla Node.js",
    slug: "nodejs",
    content: (
      <div className="space-y-6 text-white/80">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">Usage: Vanilla Node.js</h1>
        <p className="text-lg leading-relaxed text-white/60">
          Getting started in a standard Node.js, Express, Fastify, or plain TypeScript backend is incredibly easy.
        </p>
        
        <div className="space-y-4 mt-10">
          <h2 className="text-2xl font-semibold text-white tracking-tight">1. Install Dependencies</h2>
          <p className="leading-relaxed text-white/60">You will need to install `tmapper` along with `reflect-metadata` to ensure decorators work properly.</p>
          <CodeBlock code={`npm install tmapper reflect-metadata\n# or\npnpm add tmapper reflect-metadata\n# or\nyarn add tmapper reflect-metadata`} language="bash" />
        </div>

        <div className="space-y-4 mt-10">
          <h2 className="text-2xl font-semibold text-white tracking-tight">2. TypeScript Configuration</h2>
          <p className="leading-relaxed text-white/60">Ensure that your `tsconfig.json` has the following compiler options enabled so that decorators function correctly:</p>
          <CodeBlock code={`{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}`} language="json" />
        </div>

        <div className="space-y-4 mt-10">
          <h2 className="text-2xl font-semibold text-white tracking-tight">3. Import Global Polyfill</h2>
          <p className="leading-relaxed text-white/60">At the very entry point of your application (e.g., `index.ts` or `main.ts`), import the metadata polyfill before doing anything else.</p>
          <CodeBlock code={`import "reflect-metadata";
import { Mapper } from "tmapper";

// Your app logic here
const dto = Mapper.map(entity, MyDto);`} language="typescript" />
        </div>
      </div>
    ),
  },
  {
    title: "Usage: NestJS",
    slug: "nestjs",
    content: (
      <div className="space-y-6 text-white/80">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">Usage: NestJS</h1>
        <p className="text-lg leading-relaxed text-white/60">
          `tmapper` ships with a first-class NestJS module featuring dependency injection, async configuration, and built-in `class-validator` integration.
        </p>
        
        <div className="space-y-4 mt-10">
          <h2 className="text-2xl font-semibold text-white tracking-tight">1. Installation</h2>
          <p className="leading-relaxed text-white/60">NestJS projects already have `reflect-metadata` configured out of the box, so you only need the core package.</p>
          <CodeBlock code={`npm install tmapper`} language="bash" />
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-white tracking-tight mb-4">2. Module Configuration</h2>
          <p className="leading-relaxed mb-4">Import the `MapperModule` into your root `AppModule`. By default, this registers the mapper as a global module.</p>
          <CodeBlock code={`import { Module } from "@nestjs/common";
import { MapperModule } from "tmapper/nestjs";

@Module({
  imports: [
    MapperModule.forRoot({
      // 🚀 Automatically run class-validator after mapping!
      enableValidation: true, 
      
      // Pass contextual data globally to all your transform functions
      globalExtras: { tz: "UTC" }
    }),
  ],
})
export class AppModule {}`} language="typescript" />
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-white tracking-tight mb-4">Async Configuration</h2>
          <p className="leading-relaxed mb-4">If you need to load options dynamically (e.g. from `ConfigService`), use `forRootAsync`:</p>
          <CodeBlock code={`MapperModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    enableValidation: config.get('MAPPER_VALIDATION'),
  }),
})`} language="typescript" />
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-white tracking-tight mb-4">3. Injecting the Service</h2>
          <p className="leading-relaxed mb-4">Inject the `MapperService` into your controllers or services. If `enableValidation` is true, you can use `mapAndValidate` to throw standard NestJS ValidationErrors!</p>
          <CodeBlock code={`import { Injectable, BadRequestException } from "@nestjs/common";
import { MapperService } from "tmapper/nestjs";

@Injectable()
export class UserService {
  constructor(private readonly mapper: MapperService) {}

  async getUser(id: string): Promise<UserDto> {
    const user = await this.db.users.findById(id);
    
    // Automatically validates UserDto and throws if invalid!
    try {
      return await this.mapper.mapAndValidate(user, UserDto);
    } catch (errors) {
      throw new BadRequestException(errors);
    }
  }

  async getPublicProfile(id: string) {
    const user = await this.db.users.findById(id);
    
    // Use projection natively in NestJS
    return this.mapper.pick(user, UserDto, ["username", "avatar"]);
  }
}`} language="typescript" />
        </div>
      </div>
    ),
  },
  {
    title: "Quick Start",
    slug: "quick-start",
    content: (
      <div className="space-y-6 text-white/80">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">Quick Start</h1>
        <p className="text-lg leading-relaxed text-white/60">
          The fundamental concept behind tmapper is defining the mapping rules directly on your Target DTOs, rather than creating separate mapping profiles.
        </p>
        
        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-white tracking-tight mb-4">1. Define Your DTO</h2>
          <p className="leading-relaxed mb-4">Use decorators like `@AutoMap()` to map properties with the same name, or `@MapFrom()` to handle complex transformations.</p>
          <CodeBlock code={`import { AutoMap, MapFrom } from "tmapper";

class UserDto {
  // Maps src.username directly to dto.username
  @AutoMap()
  username: string;

  // Pulls data deeply from a nested object
  @MapFrom("profile.avatar.url")
  avatarUrl: string;

  // Accepts a custom function for complex, conditional mapping
  @MapFrom((src) => src.age >= 18)
  isAdult: boolean;

  @AutoMap()
  email: string;
}`} language="typescript" />
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-white tracking-tight mb-4">2. Map Your Objects</h2>
          <p className="leading-relaxed mb-4">Once your DTO is decorated, you can pass your source object (like an ORM entity) to the `Mapper` class.</p>
          <CodeBlock code={`import { Mapper } from "tmapper";

const userEntity = {
  username: "johndoe",
  age: 25,
  profile: { avatar: { url: "https://example.com/avatar.jpg" } },
  email: "john@example.com"
};

// Map a single object
const userDto = Mapper.map(userEntity, UserDto);
console.log(userDto.isAdult); // true

// Or map an entire array efficiently
const userDtos = Mapper.mapArray([userEntity, userEntity2], UserDto);`} language="typescript" />
        </div>
      </div>
    ),
  },
  {
    title: "Type-Safe Configs",
    slug: "type-safe-configs",
    content: (
      <div className="space-y-6 text-white/80">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">Type-Safe Configurations</h1>
        <p className="text-lg leading-relaxed text-white/60">
          If you prefer configuring mappings programmatically rather than using decorators, `tmapper` exports a powerful `createMapping` utility that gives you **full IntelliSense** for source paths and transforms.
        </p>
        
        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-white tracking-tight mb-4">The Builder Pattern</h2>
          <p className="leading-relaxed mb-4">By providing the `TSource` and `TTarget` generic arguments, `tmapper` analyzes your source type and provides autocomplete for deep dot-notated paths using the `PathsOf` utility type.</p>
          <CodeBlock code={`import { createMapping } from "tmapper";

interface UserEntity {
  username: string;
  profile: { avatar: string; bio: string };
  age: number;
}

// 🪄 You will get autocomplete for 'profile.avatar' here!
const toUserDto = createMapping<UserEntity, UserDto>({
  avatarUrl: "profile.avatar",
  
  // Transform functions are also strictly typed
  isAdult: (src) => src.age >= 18 
});

// Usage
const dto = toUserDto(userEntity);`} language="typescript" />
        </div>
      </div>
    ),
  },
  {
    title: "Decorators",
    slug: "decorators",
    content: (
      <div className="space-y-6 text-white/80">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">Decorators</h1>
        <p className="text-lg leading-relaxed text-white/60">
          Decorators are the heart of `tmapper`. They allow you to declaratively define how data flows from your source object into your DTO.
        </p>
        
        <div className="my-10 w-full overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02]">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-white/5 text-white">
              <tr>
                <th className="p-4 border-b border-white/10 font-medium">Decorator</th>
                <th className="p-4 border-b border-white/10 font-medium">Description</th>
                <th className="p-4 border-b border-white/10 font-medium">Example</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/70">
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="p-4 font-mono text-blue-300">@AutoMap()</td>
                <td className="p-4 leading-relaxed">Automatically maps a property with the exact same name from the source object.</td>
                <td className="p-4 font-mono text-xs">@AutoMap() name: string</td>
              </tr>
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="p-4 font-mono text-blue-300">@MapFrom(path)</td>
                <td className="p-4 leading-relaxed">Extracts a value using a dot-notated string path, avoiding null-pointer exceptions if intermediate keys are missing.</td>
                <td className="p-4 font-mono text-xs">@MapFrom('profile.avatar') url: string</td>
              </tr>
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="p-4 font-mono text-blue-300">@MapFrom(fn)</td>
                <td className="p-4 leading-relaxed">Executes a custom transformation function for ultimate flexibility.</td>
                <td className="p-4 font-mono text-xs">@MapFrom(src ={'>'} src.age {'>'} 18)</td>
              </tr>
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="p-4 font-mono text-blue-300">@FieldGroup(...groups)</td>
                <td className="p-4 leading-relaxed">Assigns the property to one or more logical groups for conditional projection.</td>
                <td className="p-4 font-mono text-xs">@FieldGroup('admin', 'public')</td>
              </tr>
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="p-4 font-mono text-blue-300">@Ignore()</td>
                <td className="p-4 leading-relaxed">Explicitly skips mapping this property, which is useful when inheriting from other classes.</td>
                <td className="p-4 font-mono text-xs">@Ignore() internalId: string</td>
              </tr>
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="p-4 font-mono text-blue-300">@NestedType(() ={'>'} Type)</td>
                <td className="p-4 leading-relaxed">Declares a nested DTO mapping. It will recursively map the nested object or array using its own decorators.</td>
                <td className="p-4 font-mono text-xs">@NestedType(() ={'>'} AddressDto)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    ),
  },
  {
    title: "Mapping API",
    slug: "mapping-api",
    content: (
      <div className="space-y-6 text-white/80">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">Mapping API</h1>
        <p className="text-lg leading-relaxed text-white/60">Core static methods provided by the `Mapper` class.</p>
        
        <h2 className="text-2xl font-semibold text-white tracking-tight mt-8">Mapper.map</h2>
        <CodeBlock code={`Mapper.map(source, TargetDto, options?)`} language="typescript" />
        <p className="leading-relaxed">Maps a single source object to the TargetDto class.</p>

        <h2 className="text-2xl font-semibold text-white tracking-tight mt-10">Mapper.mapArray</h2>
        <CodeBlock code={`Mapper.mapArray(sources, TargetDto, options?)`} language="typescript" />
        <p className="leading-relaxed">Maps an array of source objects efficiently.</p>
        
        <h2 className="text-2xl font-semibold text-white tracking-tight mt-10">Mapper.createMapper</h2>
        <CodeBlock code={`const mapToUser = Mapper.createMapper(TargetDto, options?);
const users = entities.map(mapToUser);`} language="typescript" />
        <p className="leading-relaxed">Creates and returns a reusable mapping closure. This is highly recommended when dealing with massive datasets, as it avoids re-evaluating options on every single array iteration.</p>
      </div>
    ),
  },
  {
    title: "Projection Options",
    slug: "projection-options",
    content: (
      <div className="space-y-6 text-white/80">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">Runtime Field Projection</h1>
        <p className="text-lg leading-relaxed text-white/60">
          This is the killer feature of `tmapper`. Instead of creating a `UserDto`, a `UserMinimalDto`, a `UserPublicDto`, and so on, you define one master DTO and dynamically project fields at runtime.
        </p>
        
        <p className="leading-relaxed mt-4">
          This drastically reduces the surface area of your codebase, making it much easier to maintain validation schemas and documentation.
        </p>

        <div className="mt-8 space-y-8">
          <div>
            <h3 className="text-xl font-semibold text-white tracking-tight mb-3">Picking Fields</h3>
            <p className="text-white/60 mb-4">Use `Mapper.pick` to exclusively select specific fields to map. All other fields will be ignored.</p>
            <CodeBlock code={`// Only maps 'username' and 'avatarUrl'
const publicUser = Mapper.pick(userEntity, UserDto, ["username", "avatarUrl"]);`} language="typescript" />
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white tracking-tight mb-3">Omitting Fields</h3>
            <p className="text-white/60 mb-4">Use `Mapper.omit` to map everything except for specific sensitive fields.</p>
            <CodeBlock code={`// Maps everything EXCEPT the email field
const safeUser = Mapper.omit(userEntity, UserDto, ["email"]);`} language="typescript" />
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-white tracking-tight mb-3">Passing Options Object</h3>
            <p className="text-white/60 mb-4">You can also pass an options object to the standard `map` function if you need to determine the projection dynamically.</p>
            <CodeBlock code={`const options = isAdmin ? {} : { omit: ["email"] };
const result = Mapper.map(userEntity, UserDto, options);`} language="typescript" />
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Field Groups",
    slug: "field-groups",
    content: (
      <div className="space-y-6 text-white/80">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">Field Groups</h1>
        <p className="text-lg leading-relaxed text-white/60">
          Field groups allow you to define semantic, reusable sets of fields. Instead of manually picking or omitting fields everywhere, you define groups in the DTO once and map by group anywhere.
        </p>

        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-white tracking-tight mb-4">Using Built-in Groups</h2>
          <p className="leading-relaxed mb-4">`tmapper` ships with a heavily typed `Groups` object that provides constants like `Groups.MINIMAL`, `Groups.PUBLIC`, `Groups.DETAILED`, etc. This provides auto-complete right out of the box.</p>
          <CodeBlock code={`import { FieldGroup, Groups, Mapper } from "tmapper";

class UserDto {
  @FieldGroup(Groups.MINIMAL, Groups.PUBLIC)
  @AutoMap()
  username: string;

  @FieldGroup(Groups.PUBLIC)
  @MapFrom("profile.bio")
  bio: string;

  @FieldGroup(Groups.PRIVATE)
  @AutoMap()
  email: string;
}

// Map the minimal fields
Mapper.group(userEntity, UserDto, Groups.MINIMAL); // { username }`} language="typescript" />
        </div>
        
        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-white tracking-tight mb-4">Creating Custom Groups</h2>
          <p className="leading-relaxed mb-4">If the built-in groups aren't enough, you can create your own strongly-typed group object using `createFieldGroups()`.</p>
          <CodeBlock code={`import { createFieldGroups } from "tmapper";

// Define your domain-specific groups
export const DomainGroups = createFieldGroups("mobile_app", "web_dashboard");

// Now you get autocomplete when using DomainGroups.mobile_app!`} language="typescript" />
        </div>
      </div>
    ),
  },
  {
    title: "Advanced Mapping",
    slug: "advanced",
    content: (
      <div className="space-y-6 text-white/80">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">Advanced Mapping</h1>
        <p className="text-lg leading-relaxed text-white/60">
          `tmapper` exposes powerful features to handle edge cases, runtime context, and global type conventions.
        </p>
        
        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-white tracking-tight mb-4">Context & Extras</h2>
          <p className="leading-relaxed mb-4">Sometimes, you need external data (like the current user's role) to decide how to transform a field. The `extras` object allows you to pass data into the mapping context, which is then passed as a second argument to any `@MapFrom` function.</p>
          <CodeBlock code={`class PostDto {
  // Access the context argument to read the extras
  @MapFrom((src, ctx) => ctx?.extras?.isAdmin ? src.secretNotes : null)
  notes: string;
}

// Pass the context into the map call
Mapper.map(postEntity, PostDto, { 
  extras: { isAdmin: true } 
});`} language="typescript" />
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-white tracking-tight mb-4">Global Type Converters</h2>
          <p className="leading-relaxed mb-4">Instead of manually formatting Dates to Strings or Booleans to Numbers across your entire application, you can register global converters.</p>
          <CodeBlock code={`import { Mapper } from "tmapper";

// Convert all Date sources to ISO string targets globally
Mapper.registerConverter({
  sourceType: Date,
  targetType: String,
  convert: (date: Date) => date.toISOString()
});`} language="typescript" />
        </div>
      </div>
    ),
  },
  {
    title: "Performance",
    slug: "performance",
    content: (
      <div className="space-y-6 text-white/80">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">Performance Architecture</h1>
        <p className="text-lg leading-relaxed text-white/60">
          `tmapper` was engineered specifically to solve the performance issues found in other mapping libraries like `@automapper/nestjs` or `class-transformer`.
        </p>
        
        <h2 className="text-2xl font-semibold text-white tracking-tight mt-10 mb-4">The Reflection Bottleneck</h2>
        <p className="leading-relaxed mb-6">
          Most libraries read decorator metadata using `Reflect.getMetadata` every single time they map an object. When mapping an array of 10,000 objects, they perform 10,000 reflection lookups. Reflection is notoriously slow in V8 (the Node.js engine).
        </p>

        <h2 className="text-2xl font-semibold text-white tracking-tight mt-10 mb-4">The Closure Compilation Strategy</h2>
        <p className="leading-relaxed mb-6">
          `tmapper` entirely bypasses this issue. The very first time you map a `UserEntity` to a `UserDto`, tmapper reads the decorators and internally caches the mapping configuration inside a central `MappingRegistry`.
        </p>
        
        <p className="leading-relaxed mb-6">
          It splits standard dot-notation path mappings away from custom transform functions. It then builds a highly-optimized closure function that iterates over the properties in a tight `for` loop, eliminating the need to ever call `Reflect.getMetadata` again. This closure is cached globally. Subsequent mapping operations run instantly.
        </p>

        <div className="my-10 w-full overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02]">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-white/5 text-white">
              <tr>
                <th className="p-4 border-b border-white/10 font-medium">Operation</th>
                <th className="p-4 border-b border-white/10 font-medium">tmapper</th>
                <th className="p-4 border-b border-white/10 font-medium">Other Mappers</th>
                <th className="p-4 border-b border-white/10 font-medium">Native Hand-mapping</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/70">
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="p-4">Single map execution</td>
                <td className="p-4 font-bold text-green-400">~0.002ms</td>
                <td className="p-4">~0.050ms</td>
                <td className="p-4">~0.001ms</td>
              </tr>
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="p-4">Array map (1,000 items)</td>
                <td className="p-4 font-bold text-green-400">~1.5ms</td>
                <td className="p-4">~40ms - 80ms</td>
                <td className="p-4">~1ms</td>
              </tr>
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="p-4">Memory footprint</td>
                <td className="p-4 font-bold text-green-400">O(1) Cache</td>
                <td className="p-4">O(n) State Trees</td>
                <td className="p-4">None</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    ),
  },
];
