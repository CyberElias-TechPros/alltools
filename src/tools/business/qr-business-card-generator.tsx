"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { Callout, CopyButton, DownloadButton, Field, ResultCard, TextInput, ToolPanel, useToast } from "@/components/ui";

export default function QrBusinessCardGenerator() {
  const [name, setName] = useState("Ada Lovelace");
  const [org, setOrg] = useState("Analytical Engines");
  const [title, setTitle] = useState("Founder");
  const [phone, setPhone] = useState("+234 800 000 0000");
  const [email, setEmail] = useState("ada@example.com");
  const [website, setWebsite] = useState("https://example.com");
  const [address, setAddress] = useState("Lagos, Nigeria");
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const toast = useToast();

  const vcard = useMemo(
    () =>
      [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${name}`,
        org ? `ORG:${org}` : "",
        title ? `TITLE:${title}` : "",
        phone ? `TEL;TYPE=CELL:${phone}` : "",
        email ? `EMAIL;TYPE=INTERNET:${email}` : "",
        website ? `URL:${website}` : "",
        address ? `ADR;TYPE=WORK:;;${address.replace(/,/g, "\\,")}` : "",
        "END:VCARD",
      ]
        .filter(Boolean)
        .join("\n"),
    [name, org, title, phone, email, website, address],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    QRCode.toCanvas(canvas, vcard, { width: 320, margin: 2, errorCorrectionLevel: "M", color: { dark: "#14140f", light: "#ffffff" } })
      .then(() => {
        if (!cancelled) setError("");
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "That card is too long to encode.");
      });
    return () => {
      cancelled = true;
    };
  }, [vcard]);

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "business-card-qr.png";
    link.click();
    toast("QR code downloaded");
  }

  return (
    <ToolPanel>
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Full name" htmlFor="vcard-name">
            <TextInput id="vcard-name" value={name} onChange={(event) => setName(event.target.value)} />
          </Field>
          <Field label="Company" htmlFor="vcard-org">
            <TextInput id="vcard-org" value={org} onChange={(event) => setOrg(event.target.value)} />
          </Field>
          <Field label="Job title" htmlFor="vcard-title">
            <TextInput id="vcard-title" value={title} onChange={(event) => setTitle(event.target.value)} />
          </Field>
          <Field label="Phone" htmlFor="vcard-phone">
            <TextInput id="vcard-phone" value={phone} onChange={(event) => setPhone(event.target.value)} className="font-mono text-[0.8rem]" inputMode="tel" />
          </Field>
          <Field label="Email" htmlFor="vcard-email">
            <TextInput id="vcard-email" value={email} onChange={(event) => setEmail(event.target.value)} className="font-mono text-[0.8rem]" inputMode="email" />
          </Field>
          <Field label="Website" htmlFor="vcard-web">
            <TextInput id="vcard-web" value={website} onChange={(event) => setWebsite(event.target.value)} className="font-mono text-[0.8rem]" spellCheck={false} />
          </Field>
          <Field label="Address" htmlFor="vcard-address">
            <TextInput id="vcard-address" value={address} onChange={(event) => setAddress(event.target.value)} />
          </Field>
        </div>

        <ResultCard
          label="Contact QR"
          value={<span className="font-mono text-[0.8rem]">Scan to save contact</span>}
          sub="vCard 3.0 · works with iOS and Android cameras"
          tone="brand"
          actions={
            <>
              <DownloadButton filename="business-card-qr.png" content="" onDownload={download} label="PNG" />
              <CopyButton text={vcard} label="Copy vCard" />
            </>
          }
        >
          <div className="flex justify-center border border-[var(--border)] bg-white p-3">
            <canvas ref={canvasRef} className="max-w-full" aria-label="QR code containing your contact details" />
          </div>
          <p className="mt-2 text-center font-mono text-[0.58rem] uppercase tracking-[0.12em] text-[var(--text-subtle)]">vCard 3.0</p>
        </ResultCard>
      </div>

      {error && <Callout tone="warning">{error}</Callout>}

      <div className="mt-6">
        <pre className="max-h-48 overflow-auto border border-[var(--border)] bg-[var(--surface-muted)] p-3 font-mono text-[0.72rem] whitespace-pre-wrap">{vcard}</pre>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        The QR code encodes a vCard, so a phone&apos;s camera offers to save a contact rather than opening a link. Keep
        the fields short: a QR code holds about 2,300 bytes at this error-correction level, and long addresses push the
        module count up until the code becomes hard to scan from a card.
      </p>
    </ToolPanel>
  );
}
