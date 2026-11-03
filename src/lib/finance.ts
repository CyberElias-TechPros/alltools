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

/* ------------------------------------------------------------------ */
/* Added with the full blueprint build-out                            */
/* ------------------------------------------------------------------ */

export interface SimpleInterestResult {
  interest: number;
  total: number;
  perPeriod: Array<{ period: number; interest: number; balance: number }>;
}

/** Straight-line interest: I = P × r × t. */
export function simpleInterest(principal: number, annualRate: number, years: number): SimpleInterestResult {
  const interest = principal * (annualRate / 100) * years;
  const perPeriod = Array.from({ length: Math.max(0, Math.min(Math.round(years), 50)) }, (_, index) => ({
    period: index + 1,
    interest: round(principal * (annualRate / 100), 2),
    balance: round(principal + principal * (annualRate / 100) * (index + 1), 2),
  }));
  return { interest: round(interest, 2), total: round(principal + interest, 2), perPeriod };
}

export interface BreakEvenResult {
  units: number;
  revenue: number;
  contributionPerUnit: number;
  marginPercent: number;
}

/** Units needed to cover fixed costs at a given price and variable cost. */
export function breakEven(fixedCosts: number, pricePerUnit: number, variableCostPerUnit: number): BreakEvenResult | null {
  const contribution = pricePerUnit - variableCostPerUnit;
  if (!(contribution > 0)) return null;
  const units = Math.ceil(fixedCosts / contribution);
  return {
    units,
    revenue: round(units * pricePerUnit, 2),
    contributionPerUnit: round(contribution, 2),
    marginPercent: pricePerUnit > 0 ? round((contribution / pricePerUnit) * 100, 2) : Number.NaN,
  };
}

/** Restate an amount in another year's money at a constant inflation rate. */
export function inflationAdjust(
  amount: number,
  annualRate: number,
  years: number,
): { future: number; past: number; cumulative: number } {
  const factor = Math.pow(1 + annualRate / 100, years);
  return {
    future: round(amount * factor, 2),
    past: factor === 0 ? Number.NaN : round(amount / factor, 2),
    cumulative: round((factor - 1) * 100, 2),
  };
}

export function rentalYield(
  propertyValue: number,
  monthlyRent: number,
  annualCosts = 0,
): { gross: number; net: number; annualRent: number } {
  const annualRent = monthlyRent * 12;
  return {
    annualRent: round(annualRent, 2),
    gross: propertyValue > 0 ? round((annualRent / propertyValue) * 100, 3) : Number.NaN,
    net: propertyValue > 0 ? round(((annualRent - annualCosts) / propertyValue) * 100, 3) : Number.NaN,
  };
}

/** Average cost basis across several purchases of the same stock. */
export function averageSharePrice(
  purchases: Array<{ shares: number; price: number }>,
): { shares: number; cost: number; average: number } {
  const shares = purchases.reduce((sum, item) => sum + item.shares, 0);
  const cost = purchases.reduce((sum, item) => sum + item.shares * item.price, 0);
  return { shares, cost: round(cost, 4), average: shares > 0 ? round(cost / shares, 4) : Number.NaN };
}

/** Pay for regular hours plus overtime at a multiplier. */
export function overtimePay(
  hourlyRate: number,
  regularHours: number,
  overtimeHours: number,
  multiplier = 1.5,
): { regularPay: number; overtimePay: number; total: number; blendedRate: number } {
  const regular = hourlyRate * regularHours;
  const overtime = hourlyRate * multiplier * overtimeHours;
  const total = regular + overtime;
  const hours = regularHours + overtimeHours;
  return {
    regularPay: round(regular, 2),
    overtimePay: round(overtime, 2),
    total: round(total, 2),
    blendedRate: hours > 0 ? round(total / hours, 2) : Number.NaN,
  };
}

/** The hourly rate needed to hit a target income from billable hours. */
export function freelanceRate(input: {
  targetAnnualIncome: number;
  billableHoursPerWeek: number;
  weeksPerYear: number;
  annualCosts?: number;
  taxReservePercent?: number;
}): { requiredRevenue: number; billableHours: number; hourlyRate: number } {
  const { targetAnnualIncome, billableHoursPerWeek, weeksPerYear, annualCosts = 0, taxReservePercent = 0 } = input;
  const billableHours = Math.max(billableHoursPerWeek * weeksPerYear, 1);
  const requiredRevenue = (targetAnnualIncome + annualCosts) / (1 - Math.min(Math.max(taxReservePercent, 0), 90) / 100);
  return {
    requiredRevenue: round(requiredRevenue, 2),
    billableHours: round(billableHours, 2),
    hourlyRate: round(requiredRevenue / billableHours, 2),
  };
}
