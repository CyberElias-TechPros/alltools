import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "The limits of Toolora's calculators and converters: general information only, not financial, medical or legal advice.",
  alternates: { canonical: "/disclaimer/" },
};

export default function DisclaimerPage() {
  return (
    <PageShell
      title="Disclaimer"
      intro="What our results can and cannot be used for."
      breadcrumbs={[{ href: "/disclaimer/", label: "Disclaimer" }]}
      updated="2 November 2025"
    >
      <h2>General information only</h2>
      <p>
        Every tool on this site is provided for general information and educational purposes. Results
        are produced by formulas implemented in code, not by a qualified professional assessing your
        circumstances. Nothing here constitutes financial, investment, tax, legal, medical or
        engineering advice, and no professional relationship is created by using it.
      </p>

      <h2>Financial and business calculators</h2>
      <p>
        Loan, compound interest, ROI, profit margin and similar tools are planning estimates. They
        assume the inputs you provide and the stated model — usually a fixed rate, no fees and no
        tax. Real products include origination fees, insurance, variable rates, prepayment penalties
        and tax treatment that this site does not model. A lender&apos;s or accountant&apos;s
        figures govern, not ours.
      </p>
      <p>
        Nothing on this site is an offer of credit, an investment recommendation, or a prediction of
        future returns. Investments can lose value.
      </p>

      <h2>Health calculators</h2>
      <p>
        The BMI calculator is a screening aid, not a diagnosis. BMI does not measure body fat,
        muscle mass or fat distribution, and its thresholds fit some populations better than others.
        It is not suitable for children, pregnant people or athletes without professional
        interpretation. Always consult a qualified clinician about your health, and never delay
        seeking medical advice because of something you read here.
      </p>

      <h2>Conversions and technical tools</h2>
      <p>
        Unit conversions use exact international definitions where they exist, and are clearly
        labelled where conventions differ (for example US versus imperial gallons, or decimal GB
        versus binary GiB). Encoding, hashing and formatting tools implement documented standards but
        are not a substitute for a security review, and Base64 is an encoding, not encryption.
      </p>

      <h2>SEO and webmaster tools</h2>
      <p>
        Search engines change how they render results. Preview and analysis tools approximate
        appearance and measure the text you paste; they do not check live pages, and they cannot
        predict rankings. No tool on this site performs a server-side request on your behalf.
      </p>

      <h2>No guarantee of accuracy</h2>
      <p>
        We test our tools and document their methods, but software has bugs and edge cases exist.
        Results are provided without warranty of any kind. Verify anything that matters — especially
        figures used in contracts, filings, medical decisions or financial commitments — against an
        authoritative source.
      </p>

      <h2>External links</h2>
      <p>
        Links to external sites are provided for reference. We do not control that content and are
        not responsible for it.
      </p>

      <h2>Reporting a problem</h2>
      <p>
        If a result looks wrong, please tell us — see the{" "}
        <Link href="/contact/">contact page</Link> and include the values you entered. Corrections are
        prioritised over new features.
      </p>
    </PageShell>
  );
}
