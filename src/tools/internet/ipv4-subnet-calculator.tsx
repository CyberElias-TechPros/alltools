"use client";

import { useMemo, useState } from "react";
import { CopyButton, Field, ResultCard, SimpleTable, StatGrid, TextInput, ToolPanel } from "@/components/ui";
import { calculateSubnet, type SubnetResult } from "@/lib/web";

export default function Ipv4SubnetCalculator() {
  const [ip, setIp] = useState("192.168.1.70");
  const [prefix, setPrefix] = useState("26");
  const result = useMemo(() => calculateSubnet(ip, Number(prefix)), [ip, prefix]);
  const error = "error" in result ? result.error : "";
  const subnet: SubnetResult | null = error ? null : (result as SubnetResult);

  return (
    <ToolPanel>
      <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
        <Field label="IPv4 address" htmlFor="subnet-ip" hint="The device address, not the network address.">
          <TextInput
            id="subnet-ip"
            value={ip}
            onChange={(event) => setIp(event.target.value)}
            placeholder="192.168.1.70"
            spellCheck={false}
            className="font-mono text-[0.9rem]"
            invalid={Boolean(error)}
          />
        </Field>
        <Field label="Prefix / CIDR" htmlFor="subnet-prefix">
          <TextInput
            id="subnet-prefix"
            type="number"
            min={0}
            max={32}
            value={prefix}
            onChange={(event) => setPrefix(event.target.value)}
            className="font-mono text-[0.9rem]"
          />
        </Field>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {[8, 16, 22, 24, 26, 28, 30, 31, 32].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setPrefix(String(value))}
            className={`border px-2.5 py-1.5 font-mono text-[0.65rem] transition-colors ${
              Number(prefix) === value
                ? "border-[var(--ring)] bg-[var(--surface-muted)] text-[var(--text)]"
                : "border-[var(--border)] text-[var(--text-subtle)] hover:border-[var(--border-strong)]"
            }`}
          >
            /{value}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {error ? (
          <div role="alert" className="border border-[#c0392b] bg-[var(--surface-muted)] p-3 font-mono text-[0.8rem] text-[#8d2f22] dark:text-[#ff9a8a]">
            {error}
          </div>
        ) : subnet ? (
          <ResultCard
            label="Network"
            value={`${subnet.network}/${subnet.prefix}`}
            tone="brand"
            sub={`${subnet.usableHosts.toLocaleString()} usable host(s) · ${subnet.kind}`}
          >
            <StatGrid
              columns={4}
              items={[
                { label: "Subnet mask", value: subnet.mask },
                { label: "Wildcard mask", value: subnet.wildcard },
                { label: "First host", value: subnet.firstHost },
                { label: "Last host", value: subnet.lastHost },
                { label: "Broadcast", value: subnet.broadcast },
                { label: "Total addresses", value: subnet.totalAddresses.toLocaleString() },
                { label: "Host bits", value: String(subnet.hostBits) },
                { label: "Scope", value: subnet.isPrivate ? "Private" : subnet.isLoopback ? "Loopback" : "Public" },
              ]}
            />

            <div className="mt-4 overflow-x-auto">
              <SimpleTable
                head={["", "Decimal", "Binary"]}
                caption="Addresses in decimal and binary"
                rows={[
                  ["IP", subnet.ip, subnet.binary.ip],
                  ["Mask", subnet.mask, subnet.binary.mask],
                  ["Network", subnet.network, subnet.binary.network],
                  ["Broadcast", subnet.broadcast, subnet.binary.broadcast],
                ]}
              />
            </div>

            {subnet.notes.length ? (
              <ul className="mt-4 space-y-1.5 border-t border-[var(--border)] pt-3 text-sm leading-relaxed text-[var(--text-subtle)]">
                {subnet.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <CopyButton text={`${subnet.network}/${subnet.prefix}`} label="Copy CIDR" />
              <CopyButton text={subnet.mask} label="Copy mask" />
              <CopyButton text={`${subnet.network} – ${subnet.broadcast}`} label="Copy range" />
            </div>
          </ResultCard>
        ) : null}
      </div>

      <p className="mt-5 text-xs leading-relaxed text-[var(--text-subtle)]">
        The maths is standard bitwise arithmetic: the mask zeroes the host bits to find the network address, and OR-ing
        the wildcard gives the broadcast. /31 point-to-point links and /32 host routes are handled as the RFCs define
        them rather than the naive “total minus two”.
      </p>
    </ToolPanel>
  );
}
