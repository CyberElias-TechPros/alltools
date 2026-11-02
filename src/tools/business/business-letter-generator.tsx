"use client";

import { useMemo, useState } from "react";
import { CopyButton, DownloadButton, Field, ResultCard, Select, TextArea, TextInput, ToolPanel } from "@/components/ui";
import { businessLetter } from "@/lib/business";

const TEMPLATES = {
  enquiry: {
    label: "Enquiry",
    subject: "Enquiry about your services",
    body: "I am writing to ask about [service or product] and whether you can accommodate [requirement] by [date].\n\nCould you confirm availability, the process and an indicative cost? I am happy to provide any further detail you need.",
  },
  complaint: {
    label: "Complaint",
    subject: "Complaint regarding order [reference]",
    body: "I am writing about [order or service] supplied on [date]. Unfortunately, [describe the problem factually, with dates and amounts].\n\nI would like [the specific remedy you are asking for]. I have attached [evidence] and would appreciate a reply within 14 days.",
  },
  request: {
    label: "Request",
    subject: "Request for [document or action]",
    body: "I am writing to request [what you need] in connection with [context].\n\nFor reference, my details are [reference or account number]. Please let me know if you need anything further from me to proceed.",
  },
  resignation: {
    label: "Resignation",
    subject: "Resignation — [your name]",
    body: "I am writing to give formal notice of my resignation from my role as [role], with my last working day being [date], in line with my notice period.\n\nThank you for the opportunity to work on [project]. I will do everything I can to hand over my work cleanly before I leave.",
  },
};

type TemplateId = keyof typeof TEMPLATES;

export default function BusinessLetterGenerator() {
  const [template, setTemplate] = useState<TemplateId>("enquiry");
  const [senderName, setSenderName] = useState("Ada Lovelace");
  const [senderAddress, setSenderAddress] = useState("12 Market Street\nLagos, Nigeria");
  const [recipientName, setRecipientName] = useState("Grace Hopper");
  const [recipientAddress, setRecipientAddress] = useState("44 Harbour Road\nLagos, Nigeria");
  const [subject, setSubject] = useState(TEMPLATES.enquiry.subject);
  const [body, setBody] = useState(TEMPLATES.enquiry.body);
  const [closing, setClosing] = useState("Yours faithfully,");

  const letter = useMemo(
    () =>
      businessLetter({
        senderName,
        senderAddress,
        date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
        recipientName,
        recipientAddress,
        subject,
        body,
        closing,
      }),
    [senderName, senderAddress, recipientName, recipientAddress, subject, body, closing],
  );

  return (
    <ToolPanel>
      <div className="grid gap-3 sm:grid-cols-[12rem_1fr]">
        <Field label="Template" htmlFor="letter-template">
          <Select
            id="letter-template"
            value={template}
            onChange={(event) => {
              const next = event.target.value as TemplateId;
              setTemplate(next);
              setSubject(TEMPLATES[next].subject);
              setBody(TEMPLATES[next].body);
            }}
          >
            {Object.entries(TEMPLATES).map(([id, item]) => (
              <option key={id} value={id}>
                {item.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Subject line" htmlFor="letter-subject">
          <TextInput id="letter-subject" value={subject} onChange={(event) => setSubject(event.target.value)} />
        </Field>
        <Field label="Your name" htmlFor="letter-sender">
          <TextInput id="letter-sender" value={senderName} onChange={(event) => setSenderName(event.target.value)} />
        </Field>
        <Field label="Your address" htmlFor="letter-sender-address">
          <TextArea id="letter-sender-address" value={senderAddress} onChange={(event) => setSenderAddress(event.target.value)} rows={2} className="min-h-16" />
        </Field>
        <Field label="Recipient" htmlFor="letter-recipient">
          <TextInput id="letter-recipient" value={recipientName} onChange={(event) => setRecipientName(event.target.value)} />
        </Field>
        <Field label="Recipient address" htmlFor="letter-recipient-address">
          <TextArea id="letter-recipient-address" value={recipientAddress} onChange={(event) => setRecipientAddress(event.target.value)} rows={2} className="min-h-16" />
        </Field>
      </div>

      <div className="mt-3">
        <Field label="Body" htmlFor="letter-body" hint="Replace every bracket with a fact before sending.">
          <TextArea id="letter-body" value={body} onChange={(event) => setBody(event.target.value)} rows={8} />
        </Field>
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <Field label="Closing" htmlFor="letter-closing" className="w-56">
          <Select id="letter-closing" value={closing} onChange={(event) => setClosing(event.target.value)}>
            <option value="Yours faithfully,">Yours faithfully, (no name known)</option>
            <option value="Yours sincerely,">Yours sincerely, (name known)</option>
            <option value="Kind regards,">Kind regards,</option>
            <option value="Best regards,">Best regards,</option>
          </Select>
        </Field>
      </div>

      <div className="mt-6">
        <ResultCard
          label="Letter"
          value={<span className="font-mono text-[0.8rem]">Draft ready</span>}
          sub={`${letter.split(/\s+/).length} words · British letter conventions`}
          tone="brand"
          actions={
            <>
              <CopyButton text={letter} label="Copy" />
              <DownloadButton filename="business-letter.txt" content={letter} label="Download" />
            </>
          }
        >
          <pre className="max-h-96 overflow-auto border border-[var(--border)] bg-white p-5 font-[inherit] text-sm leading-relaxed whitespace-pre-wrap text-[#14140f]">{letter}</pre>
        </ResultCard>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        British convention: &ldquo;Dear Sir or Madam&rdquo; closes with &ldquo;Yours faithfully&rdquo;, while a named
        recipient closes with &ldquo;Yours sincerely&rdquo;. Keep the same point size and font as your letterhead, and put
        the date in full rather than numeric — &ldquo;4 March 2025&rdquo; cannot be misread as April.
      </p>
    </ToolPanel>
  );
}
