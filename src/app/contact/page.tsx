import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { ContactForm } from "@/components/contact-form";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Toolora",
  description:
    "Report a wrong result, request a tool, flag an accessibility problem or ask a privacy question.",
  alternates: { canonical: "/contact/" },
};

export default function ContactPage() {
  return (
    <PageShell
      title="Contact"
      intro="Found a wrong calculation? Need a tool that does not exist yet? Tell us — specific reports are the fastest way to improve this site."
      breadcrumbs={[{ href: "/contact/", label: "Contact" }]}
      updated="2 November 2025"
    >
      <div className="not-prose grid gap-5 sm:grid-cols-[1.2fr_1fr]">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <h2 className="text-sm font-semibold text-[var(--text)]">Send a message</h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            This form opens your own email app with the message ready to send — there is no server
            collecting form data.
          </p>
          <div className="mt-3">
            <ContactForm />
          </div>
        </div>

        <div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
            <Mail className="size-4 text-[var(--text-subtle)]" aria-hidden />
            <p className="mt-2 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-[var(--text-subtle)]">
              Email
            </p>
            <a href={`mailto:${siteConfig.email}`} className="mt-1 block break-all text-sm font-medium link">
              {siteConfig.email}
            </a>
            <p className="mt-2 text-xs text-[var(--text-muted)]">
              Replace this address with a monitored inbox before launch — see the deployment notes
              in the project README.
            </p>
          </div>

          <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--text-muted)]">
            <p className="font-semibold text-[var(--text)]">What to include</p>
            <ul className="mt-2 ml-4 list-disc space-y-1 text-xs">
              <li>The tool name and the values you entered</li>
              <li>What you expected and what you got</li>
              <li>Your browser and device, for interface bugs</li>
            </ul>
            <p className="mt-3 text-xs">
              Please do not include passwords, private documents or personal data in a bug report.
            </p>
          </div>
        </div>
      </div>

      <h2>Response times</h2>
      <p>
        This is an independent project, so replies are not instantaneous. Corrections to a wrong
        result are prioritised over feature requests, and reported accessibility problems are
        treated as defects rather than enhancements.
      </p>

      <h2>Other things worth reading</h2>
      <ul>
        <li>
          <Link href="/editorial-policy/">Editorial policy</Link> — how content is researched and
          corrected.
        </li>
        <li>
          <Link href="/accessibility/">Accessibility statement</Link> — how to report a barrier.
        </li>
        <li>
          <Link href="/privacy-policy/">Privacy policy</Link> — what is and is not collected.
        </li>
      </ul>
    </PageShell>
  );
}
