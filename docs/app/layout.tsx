import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const plusJakartaSansHeading = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "tmapper - High-performance object mapping for TypeScript",
  description: "A lightweight, decorator-driven mapper with runtime field projection, compiled caching, and zero runtime dependencies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html
        lang="en"
        className={cn(
          "h-full",
          "antialiased",
          "dark",
          plusJakartaSans.variable,
          plusJakartaSansHeading.variable,
          jetBrainsMono.variable,
          "font-sans"
        )}
      >
        <body className="min-h-full flex flex-col">{children}</body>
      </html>
  );
}
