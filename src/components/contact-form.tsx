"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button, CopyButton, Field, Select, TextArea, TextInput } from "@/components/ui";
import { siteConfig } from "@/lib/site";

const TOPICS = [
  "Wrong result",
  "Tool request",
  "Accessibility problem",
  "Privacy question",
  "Something else",
];

/**
 * No-backend contact form: it composes a mailto: link in the visitor's own
 * email client. This keeps the static build free of server secrets and avoids
 * a half-working form endpoint — a common cause of lost messages.
 */
export function ContactForm() {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [touched, setTouched] = useState(false);

  const problem = touched && message.trim().length < 10
    ? "Please add at least a sentence so we can help."
    : "";

  const subject = `[${siteConfig.name}] ${topic}`;
  const body = `${message}\n\n---\nTopic: ${topic}\nReply to: ${email || "(not provided)"}\nPage: ${typeof window !== "undefined" ? window.location.href : ""}`;
  const mailto = `mailto:${siteConfig.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        setTouched(true);
        if (message.trim().length < 10) return;
        window.location.href = mailto;
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Topic" htmlFor="contact-topic">
          <Select id="contact-topic" value={topic} onChange={(event) => setTopic(event.target.value)}>
            {TOPICS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Your email" htmlFor="contact-email" optional hint="Only if you want a reply">
          <TextInput
            id="contact-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </Field>
      </div>
      <Field label="Message" htmlFor="contact-message" error={problem} hint="Include the values you entered if you are reporting a result.">
        <TextArea
          id="contact-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onBlur={() => setTouched(true)}
          className="min-h-32"
          placeholder="What happened, and what did you expect?"
        />
      </Field>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="primary">
          <Send className="size-4" aria-hidden /> Open email app
        </Button>
        <CopyButton text={siteConfig.email} label="Copy address" />
      </div>
      <p className="text-[0.7rem] text-[var(--text-subtle)]">
        Nothing is submitted to a server. Your email client opens with the message pre-filled.
      </p>
    </form>
  );
}
