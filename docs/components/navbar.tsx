import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  return (
    <header className={cn("w-full z-50 transition-all", className)}>
      <div className="container flex h-14 max-w-screen-2xl items-center px-6 md:px-12 mx-auto justify-between">
        <Link
          href="/"
          className="flex items-center space-x-3 opacity-90 hover:opacity-100 transition-opacity"
        >
          <Image src="/logo.svg" alt="tmapper logo" width={28} height={28} />
        </Link>
        <nav className="flex items-center space-x-8 text-sm font-medium">
          <Link
            href="/docs"
            className="transition-colors hover:text-white text-white/60"
          >
            Docs
          </Link>
          <Link
            href="https://github.com/ErrorX407/tmapper"
            className="transition-colors hover:text-white text-white/60"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </Link>
        </nav>
      </div>
    </header>
  );
}
