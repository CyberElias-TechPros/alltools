"use client";

import { TransformTool } from "@/components/tools/transform-tool";
import { buildSchema } from "@/lib/seo-tools";

const SAMPLE = `Q: Do these tools work offline?
A: Yes. Once the page has loaded, everything runs in the browser and no request is made.

Q: Is my data uploaded?
A: No. Processing happens on your device, so pasted content never leaves the tab.`;

function parseFaqs(input: string) {
  return input
    .split(/\n\s*\n/)
    .map((block) => {
      const question = /^\s*Q:\s*(.+)$/im.exec(block)?.[1]?.trim() ?? "";
      const answer = /^\s*A:\s*([\s\S]+)$/im.exec(block)?.[1]?.trim() ?? "";
      return { question, answer };
    })
    .filter((faq) => faq.question && faq.answer);
}

export default function FaqSchemaGenerator() {
  return (
    <TransformTool
      id="faq-schema-generator"
      inputLabel="Questions and answers"
      outputLabel="FAQPage JSON-LD"
      placeholder={"Q: Question one?\nA: Answer one.\n\nQ: Question two?\nA: Answer two."}
      sample={SAMPLE}
      mono
      rows={12}
      downloadName="faq-schema.json"
      run={(input) => {
        if (!input.trim()) return { output: "" };
        const faqs = parseFaqs(input);
        if (!faqs.length) {
          return { error: "No question/answer pairs found. Use “Q:” and “A:” at the start of lines, with a blank line between pairs." };
        }
        const { script, issues } = buildSchema({
          kind: "FAQPage",
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
          faqs,
          breadcrumbs: [],
        });
        return {
          output: script,
          note: `${faqs.length} question(s)${issues.length ? ` · ${issues.join(" ")}` : ""}`,
        };
      }}
    />
  );
}
