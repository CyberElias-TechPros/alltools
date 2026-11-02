import { round } from "./utils";

export interface LoanInput {
  principal: number;
  annualRate: number; // percent
  years: number;
  extraMonthly?: number;
  monthlyFee?: number;
}

export interface LoanRow {
  month: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
}

export interface LoanResult {
  monthlyPayment: number;
  totalInterest: number;
  totalPaid: number;
  months: number;
  schedule: LoanRow[];
}

/** Fixed-rate annuity payment. Handles a 0% rate without dividing by zero. */
export function monthlyPayment(principal: number, annualRate: number, years: number): number {
  if (!(principal > 0) || !(years > 0)) return Number.NaN;
  const periods = Math.round(years * 12);
  const rate = annualRate / 100 / 12;
  if (rate === 0) return principal / periods;
  return (principal * rate) / (1 - Math.pow(1 + rate, -periods));
}

export function buildLoanSchedule(input: LoanInput): LoanResult {
  const { principal, annualRate, years, extraMonthly = 0, monthlyFee = 0 } = input;
  const payment = monthlyPayment(principal, annualRate, years);
  const rate = annualRate / 100 / 12;
  const schedule: LoanRow[] = [];

  if (!Number.isFinite(payment)) {
    return { monthlyPayment: Number.NaN, totalInterest: Number.NaN, totalPaid: Number.NaN, months: 0, schedule };
  }

  let balance = principal;
  let totalInterest = 0;
  let totalPaid = 0;
  let month = 0;
  const maxMonths = Math.min(Math.round(years * 12) * 2, 1200);

  while (balance > 0.005 && month < maxMonths) {
    month++;
    const interest = balance * rate;
    let principalPortion = payment + extraMonthly - interest;
    if (principalPortion <= 0) break; // payment does not cover interest
    let actualPayment = payment + extraMonthly;
    if (principalPortion > balance) {
      principalPortion = balance;
      actualPayment = balance + interest;
    }
    balance = balance - principalPortion;
    totalInterest += interest;
    totalPaid += actualPayment + monthlyFee;

    schedule.push({
      month,
      payment: round(actualPayment, 2),
      interest: round(interest, 2),
      principal: round(principalPortion, 2),
      balance: round(Math.max(balance, 0), 2),
    });
  }

  return {
    monthlyPayment: round(payment, 2),
    totalInterest: round(totalInterest, 2),
    totalPaid: round(totalPaid, 2),
    months: month,
    schedule,
  };
}

export interface CompoundInput {
  principal: number;
  annualRate: number;
  years: number;
  compoundsPerYear: number;
  contribution: number;
  contributionFrequency: "monthly" | "annually" | "none";
  annualFeePercent?: number;
}

export interface CompoundResult {
  finalBalance: number;
  totalContributed: number;
  totalGrowth: number;
  rows: Array<{ year: number; balance: number; contributed: number; growth: number }>;
}

export function compoundInterest(input: CompoundInput): CompoundResult {
  const {
    principal,
    annualRate,
    years,
    compoundsPerYear,
    contribution,
    contributionFrequency,
    annualFeePercent = 0,
  } = input;

  const netRate = Math.max(annualRate - annualFeePercent, -99) / 100;
  const n = Math.max(compoundsPerYear, 1);
  const rows: CompoundResult["rows"] = [];

  let totalContributed = principal;
  const periodContribution =
    contributionFrequency === "monthly"
      ? (contribution * 12) / n
      : contributionFrequency === "annually"
        ? contribution / n
        : 0;

  let balance = principal;
  const ratePerPeriod = netRate / n;

  for (let year = 1; year <= Math.max(1, Math.round(years)); year++) {
    for (let period = 0; period < n; period++) {
      balance = balance * (1 + ratePerPeriod) + periodContribution;
      totalContributed += periodContribution;
    }
    rows.push({
      year,
      balance: round(balance, 2),
      contributed: round(totalContributed, 2),
      growth: round(balance - totalContributed, 2),
    });
  }

  return {
    finalBalance: round(balance, 2),
    totalContributed: round(totalContributed, 2),
    totalGrowth: round(balance - totalContributed, 2),
    rows,
  };
}

export function roi(invested: number, returned: number, months?: number) {
  const gain = returned - invested;
  const simple = invested !== 0 ? (gain / Math.abs(invested)) * 100 : Number.NaN;
  const years = months && months > 0 ? months / 12 : null;
  let annualised = Number.NaN;
  if (years && invested > 0 && returned > 0) {
    annualised = (Math.pow(returned / invested, 1 / years) - 1) * 100;
  }
  return { gain: round(gain, 2), simple: round(simple, 4), annualised: round(annualised, 4) };
}

export function profitMetrics(cost: number, price: number) {
  const profit = price - cost;
  return {
    profit: round(profit, 4),
    margin: price > 0 ? round((profit / price) * 100, 4) : Number.NaN,
    markup: cost > 0 ? round((profit / cost) * 100, 4) : Number.NaN,
  };
}

export function priceForMargin(cost: number, marginPercent: number): number {
  if (marginPercent >= 100) return Number.NaN;
  return round(cost / (1 - marginPercent / 100), 4);
}
