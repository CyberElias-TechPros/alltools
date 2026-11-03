"use client";

import { TransformTool } from "@/components/tools/transform-tool";
import { buildSchema } from "@/lib/seo-tools";

const SAMPLE = `Home | https://example.com/
Tools | https://example.com/tools
Unit converter | https://example.com/unit-converter`;

export default function BreadcrumbSchemaGenerator() {
  return (
    <TransformTool
      id="breadcrumb-schema-generator"
      inputLabel="Breadcrumb trail"
      outputLabel="BreadcrumbList JSON-LD"
      placeholder={"Home | https://example.com/\nTools | https://example.com/tools\nPage | https://example.com/page"}
      sample={SAMPLE}
      mono
      rows={8}
      downloadName="breadcrumbs.json"
      run={(input) => {
        if (!input.trim()) return { output: "" };
        const breadcrumbs = input
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => {
            const [name, url] = line.split("|").map((part) => part.trim());
            return { name: name ?? "", url: url ?? "" };
          });

        if (breadcrumbs.some((crumb) => !crumb.url)) {
          return { error: "Every line needs a name and a URL separated by a pipe: Home | https://example.com/" };
        }

        const { script, issues } = buildSchema({
          kind: "BreadcrumbList",
          name: "",
          url: "",
          description: "",
          image: "",
          author: "",
          publisher: "",
          datePublished: "",
          price: "",
          currency: "",
          telephone: "",
          address: "",
          faqs: [],
          breadcrumbs,
        });
        return { output: script, note: `${breadcrumbs.length} level(s)${issues.length ? ` · ${issues.join(" ")}` : ""}` };
      }}
    />
  );
}
