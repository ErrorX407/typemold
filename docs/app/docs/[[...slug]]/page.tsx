import * as React from "react";
import { notFound } from "next/navigation";
import { docsData } from "@/lib/docs-content";

interface DocsPageProps {
  params: Promise<{
    slug?: string[];
  }>;
}

export default async function DocsPage({ params }: DocsPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug?.join("/") || "";
  
  const doc = docsData.find((d) => d.slug === slug);

  if (!doc) {
    notFound();
  }

  return (
    <div className="pb-12 pt-8">
      {doc.content}
    </div>
  );
}

export function generateStaticParams() {
  return docsData.map((doc) => ({
    slug: doc.slug ? doc.slug.split("/") : [],
  }));
}
