"use client";

import { useMemo, useState } from "react";
import { Callout, CopyButton, Field, ResultCard, SimpleTable, StatGrid, TextInput, ToolPanel } from "@/components/ui";
import { employeeCost, formatMoney } from "@/lib/business";

export default function EmployeeCostCalculator() {
  const [salary, setSalary] = useState("45000");
  const [taxRate, setTaxRate] = useState("14");
  const [benefits, setBenefits] = useState("3000");
  const [equipment, setEquipment] = useState("2000");
  const [training, setTraining] = useState("2");
  const [hours, setHours] = useState("40");

  const result = useMemo(
    () =>
      employeeCost({
        salary: Number(salary),
        employerTaxRate: Number(taxRate),
        benefits: Number(benefits),
        equipment: Number(equipment),
        trainingRate: Number(training),
        hoursPerWeek: Number(hours),
      }),
    [salary, taxRate, benefits, equipment, training, hours],
  );

  const text = `True annual cost: ${formatMoney(result.total)} (${formatMoney(result.monthly)} per month, ${formatMoney(result.trueHourly)} per worked hour)`;

  return (
    <ToolPanel>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Gross annual salary" htmlFor="emp-salary">
          <TextInput id="emp-salary" type="number" min={0} step="100" value={salary} onChange={(event) => setSalary(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Employer contributions %" htmlFor="emp-tax" hint="Pension, payroll taxes, insurance — from your jurisdiction.">
          <TextInput id="emp-tax" type="number" min={0} max={60} step="0.5" value={taxRate} onChange={(event) => setTaxRate(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Benefits per year" htmlFor="emp-benefits" hint="Health cover, allowances, phone.">
          <TextInput id="emp-benefits" type="number" min={0} step="100" value={benefits} onChange={(event) => setBenefits(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Equipment and setup" htmlFor="emp-equipment">
          <TextInput id="emp-equipment" type="number" min={0} step="100" value={equipment} onChange={(event) => setEquipment(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Training budget % of salary" htmlFor="emp-training">
          <TextInput id="emp-training" type="number" min={0} max={20} step="0.5" value={training} onChange={(event) => setTraining(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Paid hours per week" htmlFor="emp-hours">
          <TextInput id="emp-hours" type="number" min={1} max={80} value={hours} onChange={(event) => setHours(event.target.value)} className="font-mono" />
        </Field>
      </div>

      <div className="mt-6">
        <ResultCard
          label="True annual cost"
          value={formatMoney(result.total)}
          sub={`${formatMoney(result.monthly)} per month · ${formatMoney(result.trueHourly)} per worked hour`}
          tone="brand"
          actions={<CopyButton text={text} label="Copy" />}
        >
          <StatGrid
            columns={3}
            items={[
              { label: "Salary", value: formatMoney(result.salary) },
              { label: "Employer contributions", value: formatMoney(result.tax) },
              { label: "Cost multiplier", value: Number.isFinite(result.multiplier) ? `${result.multiplier.toFixed(2)}×` : "—" },
            ]}
          />
          <div className="mt-4">
            <SimpleTable
              head={["Component", "Amount"]}
              caption="Where the money goes"
              rows={[
                ["Gross salary", formatMoney(result.salary)],
                ["Employer contributions", formatMoney(result.tax)],
                ["Benefits", formatMoney(result.benefits)],
                ["Equipment", formatMoney(result.equipment)],
                ["Training", formatMoney(result.training)],
                ["Total", formatMoney(result.total)],
              ]}
            />
          </div>
        </ResultCard>
      </div>

      <Callout tone="info">
        The multiplier is the number most hiring plans miss: a 45,000 salary is rarely a 45,000 cost. Recruiting fees,
        unused desk space and management time sit outside this figure, and they usually add another 10–20%.
      </Callout>

      {result.issues.map((issue) => (
        <Callout key={issue} tone="warning">
          {issue}
        </Callout>
      ))}

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        Employer contribution rates differ by country and by salary band, so this tool takes your rate rather than
        assuming one. The hourly figure divides total cost by paid hours over 46 working weeks — the missing six weeks are
        leave, public holidays and sickness, which still cost money.
      </p>
    </ToolPanel>
  );
}
