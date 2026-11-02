"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Check, Copy, Download, Info, TriangleAlert } from "lucide-react";
import { cn, copyText, downloadText } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
};

export function Button({
  variant = "secondary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "btn",
        variant === "primary" && "btn-primary",
        variant === "secondary" && "btn-secondary",
        variant === "ghost" && "btn-ghost",
        size === "sm" && "!min-h-[2.05rem] !px-3 !py-1.5 !text-[0.78rem]",
        className,
      )}
      {...props}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Copy / download actions                                             */
/* ------------------------------------------------------------------ */

const ToastContext = createContext<(message: string) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function show(next: string) {
    setMessage(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(null), 2200);
  }

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-5 z-[80] flex justify-center px-4"
      >
        {message ? (
          <div className="animate-in flex items-center gap-2 rounded-full border border-[var(--text)] bg-[var(--text)] px-4 py-2 text-[0.8rem] font-medium text-[var(--page)] shadow-[var(--shadow-lg)]">
            <Check className="size-4" aria-hidden />
            {message}
          </div>
        ) : null}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

export function CopyButton({
  text,
  label = "Copy",
  size = "sm",
  variant = "secondary",
  className,
}: {
  text: string;
  label?: string;
  size?: "sm" | "md";
  variant?: ButtonProps["variant"];
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();
  const disabled = text.trim() === "";

  async function handleCopy() {
    const ok = await copyText(text);
    if (ok) {
      setCopied(true);
      toast("Copied to clipboard");
      setTimeout(() => setCopied(false), 1600);
    } else {
      toast("Could not copy — select the text manually");
    }
  }

  return (
    <Button
      size={size}
      variant={variant}
      onClick={handleCopy}
      disabled={disabled}
      aria-label={label}
      className={className}
    >
      {copied ? (
        <Check className="size-4" aria-hidden />
      ) : (
        <Copy className="size-4" aria-hidden />
      )}
      <span>{copied ? "Copied" : label}</span>
    </Button>
  );
}

export function DownloadButton({
  filename,
  content,
  mime,
  label = "Download",
  size = "sm",
  variant = "secondary",
  onDownload,
}: {
  filename: string;
  content: string;
  mime?: string;
  label?: string;
  size?: "sm" | "md";
  variant?: ButtonProps["variant"];
  /** Use for binary output (images, PDFs) instead of text content. */
  onDownload?: () => void;
}) {
  const toast = useToast();
  return (
    <Button
      size={size}
      variant={variant}
      disabled={!onDownload && content.trim() === ""}
      onClick={() => {
        if (onDownload) onDownload();
        else downloadText(filename, content, mime);
        toast("Download started");
      }}
    >
      <Download className="size-4" aria-hidden />
      <span>{label}</span>
    </Button>
  );
}

/* ------------------------------------------------------------------ */
/* Form primitives                                                     */
/* ------------------------------------------------------------------ */

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
  optional,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
  optional?: boolean;
}) {
  return (
    <div className={cn("flex flex-col", className)}>
      <label className="label" htmlFor={htmlFor}>
        {label}
        {optional ? (
          <span className="ml-1.5 font-normal text-[var(--text-subtle)]">(optional)</span>
        ) : null}
      </label>
      {children}
      {hint && !error ? (
        <p className="mt-1.5 text-xs text-[var(--text-subtle)]">{hint}</p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextInput({
  invalid,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      className={cn("input", className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

export function TextArea({
  invalid,
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      className={cn("input min-h-40 resize-y font-[inherit] leading-relaxed", className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn("input appearance-none pr-8", className)} {...props}>
      {children}
    </select>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  id: providedId,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
  id?: string;
}) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <div className="min-w-0">
        <label htmlFor={id} className="cursor-pointer text-sm font-medium text-[var(--text)]">
          {label}
        </label>
        {description ? (
          <p className="mt-0.5 text-xs text-[var(--text-subtle)]">{description}</p>
        ) : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors",
          checked
            ? "border-brand-600 bg-brand-600"
            : "border-[var(--border-strong)] bg-[var(--surface-muted)]",
        )}
      >
        <span
          className={cn(
            "inline-block size-4 rounded-full bg-[var(--page)] transition-transform",
            checked ? "translate-x-6" : "translate-x-1",
          )}
        />
      </button>
    </div>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: Array<{ value: T; label: string; hint?: string }>;
  value: T;
  onChange: (next: T) => void;
  label: string;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn(
        "flex flex-wrap gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-1",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            role="tab"
            type="button"
            aria-selected={active}
            title={option.hint}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-[0.82rem] font-semibold transition-colors",
              active
                ? "bg-[var(--surface)] text-[var(--text)] shadow-sm"
                : "text-[var(--text-muted)] hover:text-[var(--text)]",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Result presentation                                                 */
/* ------------------------------------------------------------------ */

export function ResultCard({
  label,
  value,
  sub,
  children,
  actions,
  tone = "brand",
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  tone?: "brand" | "neutral";
}) {
  return (
    <div
      aria-live="polite"
      className={cn(
        "rounded-2xl border p-4 sm:p-5",
        tone === "brand"
          ? "border-[var(--result-border)] bg-[var(--result-bg)]"
          : "border-[var(--border)] bg-[var(--surface-muted)]",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[0.64rem] font-medium uppercase tracking-[0.12em] text-[var(--text-subtle)]">
            {label}
          </p>
          <p
            className={cn(
              "mt-1.5 break-words font-mono text-[1.7rem] font-bold leading-tight sm:text-[2rem]",
              tone === "brand" ? "stat-number" : "text-[var(--text)]",
            )}
          >
            {value}
          </p>
          {sub ? <div className="mt-1.5 text-sm text-[var(--text-muted)]">{sub}</div> : null}
        </div>
        {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}

export function StatGrid({
  items,
  columns = 3,
}: {
  items: Array<{ label: string; value: ReactNode; hint?: string }>;
  columns?: 2 | 3 | 4;
}) {
  return (
    <dl
      className={cn(
        "grid gap-px overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--border)]",
        columns === 2 && "grid-cols-2",
        columns === 3 && "grid-cols-2 sm:grid-cols-3",
        columns === 4 && "grid-cols-2 sm:grid-cols-4",
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="bg-[var(--surface)] px-3.5 py-3">
          <dt className="font-mono text-[0.62rem] font-medium uppercase tracking-[0.1em] text-[var(--text-subtle)]">
            {item.label}
          </dt>
          <dd className="mt-1 font-mono text-lg font-semibold text-[var(--text)]">
            {item.value}
          </dd>
          {item.hint ? (
            <p className="mt-0.5 text-[0.7rem] text-[var(--text-subtle)]">{item.hint}</p>
          ) : null}
        </div>
      ))}
    </dl>
  );
}

export function Callout({
  tone = "info",
  title,
  children,
}: {
  tone?: "info" | "warning" | "success";
  title?: string;
  children: ReactNode;
}) {
  const Icon = tone === "warning" ? TriangleAlert : Info;
  return (
    <div
      className={cn(
        "flex gap-3 rounded-2xl border p-4 text-sm leading-relaxed",
        tone === "info" &&
          "border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)]",
        tone === "warning" &&
          "border-amber-300/70 bg-amber-50 text-amber-950 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100",
        tone === "success" &&
          "border-emerald-300/70 bg-emerald-50 text-emerald-950 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100",
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="min-w-0">
        {title ? <p className="mb-0.5 font-semibold">{title}</p> : null}
        <div className="[&_a]:underline [&_a]:underline-offset-2">{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  children,
  icon,
  description,
}: {
  title: string;
  children?: ReactNode;
  icon?: ReactNode;
  description?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-strong)] px-6 py-10 text-center">
      {icon ? <div className="mb-2 text-[var(--text-subtle)]">{icon}</div> : null}
      <p className="text-sm font-semibold text-[var(--text)]">{title}</p>
      {children ? (
        <div className="mt-1 text-sm text-[var(--text-muted)]">{children}</div>
      ) : description ? (
        <div className="mt-1 text-sm text-[var(--text-muted)]">{description}</div>
      ) : null}
    </div>
  );
}

export function SimpleTable({
  head,
  rows,
  caption,
}: {
  head: string[];
  rows: ReactNode[][];
  caption?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
      <table className="w-full border-collapse text-sm">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr className="bg-[var(--surface-muted)]">
            {head.map((cell) => (
              <th
                key={cell}
                scope="col"
                className="border-b border-[var(--border)] px-3 py-2 text-left text-[0.72rem] font-semibold uppercase tracking-[0.07em] text-[var(--text-subtle)]"
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="odd:bg-[var(--surface)] even:bg-[var(--surface-muted)]/40">
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="border-b border-[var(--border)] px-3 py-2 font-mono text-[0.82rem] text-[var(--text)] last:border-r-0"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Wrapper that gives every tool the same visual rhythm. */
export function ToolPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      /* The tool page supplies the frame and padding, so a tool panel only
         paints its own surface — no border-inside-a-border. */
      className={cn("bg-[var(--surface)]", className)}
    >
      {children}
    </div>
  );
}
