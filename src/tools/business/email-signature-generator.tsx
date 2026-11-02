"use client";

import { useMemo, useState } from "react";
import { Callout, CopyButton, DownloadButton, Field, ResultCard, Switch, TextInput, ToolPanel } from "@/components/ui";
import { emailSignature } from "@/lib/business";

export default function EmailSignatureGenerator() {
  const [name, setName] = useState("Ada Lovelace");
  const [role, setRole] = useState("Founder");
  const [company, setCompany] = useState("Analytical Engines");
  const [phone, setPhone] = useState("+234 800 000 0000");
  const [email, setEmail] = useState("ada@example.com");
  const [website, setWebsite] = useState("https://example.com");
  const [address, setAddress] = useState("Lagos, Nigeria");
  const [pronouns, setPronouns] = useState("");
  const [includePhone, setIncludePhone] = useState(true);

  const signature = useMemo(
    () =>
      emailSignature({
        name,
        role,
        company,
        phone: includePhone ? phone : "",
        email,
        website,
        address,
        pronouns,
      }),
    [name, role, company, phone, email, website, address, pronouns, includePhone],
  );

  return (
    <ToolPanel>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Full name" htmlFor="sig-name">
          <TextInput id="sig-name" value={name} onChange={(event) => setName(event.target.value)} />
        </Field>
        <Field label="Job title" htmlFor="sig-role">
          <TextInput id="sig-role" value={role} onChange={(event) => setRole(event.target.value)} />
        </Field>
        <Field label="Company" htmlFor="sig-company">
          <TextInput id="sig-company" value={company} onChange={(event) => setCompany(event.target.value)} />
        </Field>
        <Field label="Phone" htmlFor="sig-phone">
          <TextInput id="sig-phone" value={phone} onChange={(event) => setPhone(event.target.value)} className="font-mono text-[0.8rem]" inputMode="tel" />
        </Field>
        <Field label="Email" htmlFor="sig-email">
          <TextInput id="sig-email" value={email} onChange={(event) => setEmail(event.target.value)} className="font-mono text-[0.8rem]" inputMode="email" />
        </Field>
        <Field label="Website" htmlFor="sig-web">
          <TextInput id="sig-web" value={website} onChange={(event) => setWebsite(event.target.value)} className="font-mono text-[0.8rem]" spellCheck={false} />
        </Field>
        <Field label="Address" htmlFor="sig-address" optional>
          <TextInput id="sig-address" value={address} onChange={(event) => setAddress(event.target.value)} />
        </Field>
        <Field label="Pronouns" htmlFor="sig-pronouns" optional>
          <TextInput id="sig-pronouns" value={pronouns} onChange={(event) => setPronouns(event.target.value)} placeholder="she/her" />
        </Field>
      </div>

      <div className="mt-4">
        <Switch checked={includePhone} onChange={setIncludePhone} label="Include phone number" description="Useful for clients, noise for internal email." />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ResultCard
          label="Preview"
          value={<span className="font-mono text-[0.8rem]">How it renders</span>}
          sub="Plain HTML table — survives Gmail, Outlook and Apple Mail"
          tone="brand"
          actions={<CopyButton text={signature.html} label="Copy HTML" />}
        >
          <div className="border border-[var(--border)] bg-white p-4 text-[#14140f]" dangerouslySetInnerHTML={{ __html: signature.html }} />
        </ResultCard>

        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="label !mb-0">Plain text</span>
            <DownloadButton filename="email-signature.html" content={signature.html} mime="text/html" label="Download HTML" />
          </div>
          <pre className="max-h-64 overflow-auto border border-[var(--border)] bg-[var(--surface-muted)] p-3 font-mono text-[0.72rem] whitespace-pre-wrap">{signature.text}</pre>
          <p className="mt-2 text-xs leading-relaxed text-[var(--text-subtle)]">
            Paste the HTML into your mail client&apos;s signature editor in HTML mode. If the editor only accepts rich
            text, paste the plain text version and format it by hand.
          </p>
        </div>
      </div>

      <Callout tone="info">
        Keep a signature to five lines or fewer. Every line appears on every message in a thread, and images or tracking
        pixels make you look like a newsletter.
      </Callout>

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        The markup uses a table with inline styles because mail clients strip &lt;style&gt; blocks and ignore modern layout.
        Fonts are limited to system stacks for the same reason, and the accent rule is a border rather than an image so
        nothing breaks when images are blocked.
      </p>
    </ToolPanel>
  );
}
