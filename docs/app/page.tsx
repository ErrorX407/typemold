import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";
import { Navbar } from "@/components/navbar";

const rawCode = `import { Mapper, AutoMap, MapFrom } from "tmapper";\n\nclass UserDto {\n  @AutoMap()\n  username: string;\n\n  @MapFrom("profile.avatar")\n  avatarUrl: string;\n\n  @MapFrom((src) => src.age >= 18)\n  isAdult: boolean;\n}\n\n// Maps source object to Target DTO at ~0.002ms speed\nconst dto = Mapper.map(userEntity, UserDto);`;

export default function Home() {
  return (
    <div className="relative min-h-screen flex-col font-sans bg-[#0a0a0a] text-foreground selection:bg-primary selection:text-primary-foreground overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-white/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-white/5 blur-[100px] pointer-events-none"></div>

      {/* Subtle Background Grid Pattern */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar className="sticky top-2" />

        <main className="flex-1 border-x border-white/5 max-w-screen-2xl mx-auto w-full">
          {/* Hero Section */}
          <section className="relative px-4 pt-16 pb-12 md:px-8 md:pt-24 lg:pt-32 lg:pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left: Text Content */}
              <div className="lg:col-span-6 flex flex-col justify-center">
                <h1 className="font-heading  text-5xl sm:text-6xl md:text-7xl font-medium tracking-tight text-balance leading-[1.05] text-white">
                  High-performance object mapping for TypeScript.
                </h1>
                <p className="text-lg md:text-xl mt-6 leading-relaxed text-white/70 max-w-lg">
                  A lightweight, decorator-driven mapper with runtime field
                  projection, compiled caching, and zero runtime dependencies.
                  Built for speed and flexibility.
                </p>

                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <Button
                    render={<Link href="/docs" />}
                    nativeButton={false}
                    size="lg"
                    className="h-12 px-8 rounded-full bg-white text-black hover:bg-white/90 text-base font-semibold shadow-[0_0_40px_rgba(255,255,255,0.2)]"
                  >
                    Get started
                  </Button>
                  <Button
                    render={
                      <Link
                        href="https://github.com/ErrorX407/tmapper"
                        target="_blank"
                        rel="noreferrer"
                      />
                    }
                    nativeButton={false}
                    size="lg"
                    variant="outline"
                    className="h-12 px-8 rounded-full border-white/10 hover:bg-white/5 text-base font-medium text-white"
                  >
                    GitHub
                  </Button>
                </div>
              </div>

              {/* Right: Code Window */}
              <div className="lg:col-span-6 relative">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-white/10 via-white/5 to-transparent blur-lg opacity-50"></div>
                <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#111] shadow-2xl backdrop-blur-sm">
                  <div className="flex items-center px-4 py-3 border-b border-white/5 bg-black/40">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                    </div>
                    <div className="mx-auto text-xs font-mono text-white/40">
                      user.dto.ts
                    </div>
                    <CopyButton
                      value={rawCode}
                      className="text-white/40 hover:text-white"
                    />
                  </div>
                  <div className="p-6 overflow-x-auto text-[13px] sm:text-sm font-mono leading-relaxed bg-[#0d0d0d]">
                    <pre>
                      <code>
                        <span className="text-[#c678dd]">import</span> {"{ "}
                        <span className="text-[#e5c07b]">Mapper</span>,{" "}
                        <span className="text-[#e5c07b]">AutoMap</span>,{" "}
                        <span className="text-[#e5c07b]">MapFrom</span>
                        {" }"} <span className="text-[#c678dd]">from</span>{" "}
                        <span className="text-[#98c379]">"tmapper"</span>;<br />
                        <br />
                        <span className="text-[#c678dd]">class</span>{" "}
                        <span className="text-[#e5c07b]">UserDto</span> {"{"}
                        <br />
                        {"  "}
                        <span className="text-[#61afef]">@AutoMap</span>()
                        <br />
                        {"  "}
                        <span className="text-[#e06c75]">username</span>:{" "}
                        <span className="text-[#56b6c2]">string</span>;<br />
                        <br />
                        {"  "}
                        <span className="text-[#61afef]">@MapFrom</span>(
                        <span className="text-[#98c379]">"profile.avatar"</span>
                        )<br />
                        {"  "}
                        <span className="text-[#e06c75]">avatarUrl</span>:{" "}
                        <span className="text-[#56b6c2]">string</span>;<br />
                        <br />
                        {"  "}
                        <span className="text-[#61afef]">@MapFrom</span>((
                        <span className="text-[#d19a66]">src</span>){" "}
                        <span className="text-[#c678dd]">=&gt;</span> src.age{" "}
                        {">="} <span className="text-[#d19a66]">18</span>)<br />
                        {"  "}
                        <span className="text-[#e06c75]">isAdult</span>:{" "}
                        <span className="text-[#56b6c2]">boolean</span>;<br />
                        {"}"}
                        <br />
                        <br />
                        <span className="text-[#7f848e] italic">
                          // Maps source object to Target DTO at ~0.002ms speed
                        </span>
                        <br />
                        <span className="text-[#c678dd]">const</span> dto ={" "}
                        <span className="text-[#e5c07b]">Mapper</span>.
                        <span className="text-[#61afef]">map</span>(userEntity,{" "}
                        <span className="text-[#e5c07b]">UserDto</span>);
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Grid Section */}
          <section className="border-t border-white/5 bg-black/20">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/5">
              <div className="p-8 lg:p-12 transition-colors hover:bg-white/[0.02]">
                <div className="mb-6 inline-flex items-center justify-center rounded-xl bg-white/5 p-4 shadow-inner">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-7 text-white"
                  >
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                  Compiled Speed
                </h3>
                <p className="text-white/60 leading-relaxed font-medium">
                  Mappers are compiled and cached on first use, eliminating
                  reflection overhead. Performs at ~0.002ms per map.
                </p>
              </div>

              <div className="p-8 lg:p-12 transition-colors hover:bg-white/[0.02]">
                <div className="mb-6 inline-flex items-center justify-center rounded-xl bg-white/5 p-4 shadow-inner">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-7 text-white"
                  >
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                  Field Projection
                </h3>
                <p className="text-white/60 leading-relaxed font-medium">
                  Dynamically pick or omit fields at runtime. Reuse a single DTO
                  across multiple endpoints safely.
                </p>
              </div>

              <div className="p-8 lg:p-12 transition-colors hover:bg-white/[0.02]">
                <div className="mb-6 inline-flex items-center justify-center rounded-xl bg-white/5 p-4 shadow-inner">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-7 text-white"
                  >
                    <path d="m12 14 9-5-9-5-9 5 9 5z" />
                    <path d="m12 14 9-5-9-5-9 5 9 5z" />
                    <path d="m12 21 9-5-9-5-9 5 9 5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                  Zero Dependencies
                </h3>
                <p className="text-white/60 leading-relaxed font-medium">
                  Tiny ~3KB bundle size. Requires only reflect-metadata for
                  TypeScript decorators.
                </p>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-white/5 bg-[#0a0a0a] relative z-10">
          <div className="container mx-auto max-w-screen-2xl px-4 md:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Image
                src="/logo.svg"
                alt="tmapper logo"
                width={20}
                height={20}
                className="rounded-sm opacity-50 grayscale"
              />
              <p className="text-sm text-white/50 font-medium">
                Built by{" "}
                <a
                  href="https://github.com/ErrorX407"
                  target="_blank"
                  rel="noreferrer"
                  className="text-white hover:underline transition-colors"
                >
                  Chetan Joshi
                </a>
                .
              </p>
            </div>
            <p className="text-sm text-white/50 font-medium">
              Source code available on{" "}
              <a
                href="https://github.com/ErrorX407/tmapper"
                target="_blank"
                rel="noreferrer"
                className="text-white hover:underline transition-colors"
              >
                GitHub
              </a>
              .
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
