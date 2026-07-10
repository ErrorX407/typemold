"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { docsData } from "@/lib/docs-content";
import { cn } from "@/lib/utils";

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <div className="w-full">
      <div className="pb-4">
        <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-semibold">
          Documentation
        </h4>
        <div className="grid grid-flow-row auto-rows-max text-sm">
          {docsData.map((doc) => {
            const href = `/docs${doc.slug ? `/${doc.slug}` : ""}`;
            const isActive = pathname === href;
            
            return (
              <Link
                key={doc.slug}
                href={href}
                className={cn(
                  "group flex w-full items-center rounded-md border border-transparent px-2 py-1.5 transition-colors",
                  isActive 
                    ? "font-medium text-white bg-white/5" 
                    : "text-white/60 hover:text-white hover:bg-white/[0.02]"
                )}
              >
                {doc.title}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
