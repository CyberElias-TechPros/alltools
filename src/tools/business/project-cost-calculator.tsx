"use client";

import { useMemo, useState } from "react";
import { Button, Callout, CopyButton, Field, ResultCard, SimpleTable, StatGrid, TextInput, ToolPanel } from "@/components/ui";
import { formatMoney, projectCost } from "@/lib/business";

interface Role {
  id: number;
  role: string;
  hours: string;
  rate: string;
}

const SEED: Role[] = [
  { id: 1, role: "Designer", hours: "24", rate: "55" },
  { id: 2, role: "Developer", hours: "60", rate: "70" },
  { id: 3, role: "Project manager", hours: "12", rate: "60" },
];

export default function ProjectCostCalculator() {
  const [roles, setRoles] = useState<Role[]>(SEED);
  const [materials, setMaterials] = useState("300");
  const [overhead, setOverhead] = useState("15");
  const [contingency, setContingency] = useState("15");
  const [nextId, setNextId] = useState(4);

  const result = useMemo(
    () =>
      projectCost({
        roles: roles.map((role) => ({ role: role.role, hours: Number(role.hours), rate: Number(role.rate) })),
        materials: Number(materials),
        overheadRate: Number(overhead),
        contingencyRate: Number(contingency),
      }),
    [roles, materials, overhead, contingency],
  );

  const totalHours = roles.reduce((sum, role) => sum + (Number(role.hours) || 0), 0);
  const text = [`Project total: ${formatMoney(result.total)}`, `Labour ${formatMoney(result.labour)} · materials ${formatMoney(result.materials)} · overhead ${formatMoney(result.overhead)} · contingency ${formatMoney(result.contingency)}`].join("\n");

  const update = (id: number, patch: Partial<Role>) => setRoles((current) => current.map((role) => (role.id === id ? { ...role, ...patch } : role)));

  return (
    <ToolPanel>
      <div className="space-y-2">
        {roles.map((role) => (
          <div key={role.id} className="grid grid-cols-[1fr_5rem_6rem_2rem] gap-2">
            <TextInput aria-label="Role" value={role.role} onChange={(event) => update(role.id, { role: event.target.value })} placeholder="Role" />
            <TextInput aria-label="Hours" type="number" min={0} step="0.5" value={role.hours} onChange={(event) => update(role.id, { hours: event.target.value })} className="font-mono" />
            <TextInput aria-label="Hourly rate" type="number" min={0} step="1" value={role.rate} onChange={(event) => update(role.id, { rate: event.target.value })} className="font-mono" />
            <Button variant="ghost" size="sm" aria-label="Remove role" onClick={() => setRoles((current) => current.filter((item) => item.id !== role.id))}>
              ✕
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <Button
          onClick={() => {
            setRoles((current) => [...current, { id: nextId, role: "", hours: "", rate: "" }]);
            setNextId((value) => value + 1);
          }}
        >
          Add role
        </Button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Field label="Materials and licences" htmlFor="proj-materials">
          <TextInput id="proj-materials" type="number" min={0} step="0.01" value={materials} onChange={(event) => setMaterials(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Overhead %" htmlFor="proj-overhead" hint="Share of labour for tools, rent and admin.">
          <TextInput id="proj-overhead" type="number" min={0} max={100} value={overhead} onChange={(event) => setOverhead(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Contingency %" htmlFor="proj-contingency" hint="Applied to labour, materials and overhead.">
          <TextInput id="proj-contingency" type="number" min={0} max={100} value={contingency} onChange={(event) => setContingency(event.target.value)} className="font-mono" />
        </Field>
      </div>

      <div className="mt-6">
        <ResultCard
          label="Project cost"
          value={formatMoney(result.total)}
          sub={`${totalHours} hours · ${formatMoney(totalHours > 0 ? result.total / totalHours : 0)} blended per hour`}
          tone="brand"
          actions={<CopyButton text={text} label="Copy" />}
        >
          <StatGrid
            columns={4}
            items={[
              { label: "Labour", value: formatMoney(result.labour) },
              { label: "Materials", value: formatMoney(result.materials) },
              { label: "Overhead", value: formatMoney(result.overhead) },
              { label: "Contingency", value: formatMoney(result.contingency) },
            ]}
          />
          <div className="mt-4">
            <SimpleTable
              head={["Role", "Hours", "Cost"]}
              caption="Labour by role"
              rows={result.byRole.map((role) => [role.role, String(role.hours), formatMoney(role.cost)])}
            />
          </div>
        </ResultCard>
      </div>

      {result.issues.map((issue) => (
        <Callout key={issue} tone="warning">
          {issue}
        </Callout>
      ))}

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        A quote built from this number still needs a profit margin on top — the total here is cost, not price. Contingency
        is not padding: work you have not done before routinely overruns by 30–50%, and a fixed 15% is the minimum honest
        buffer.
      </p>
    </ToolPanel>
  );
}
