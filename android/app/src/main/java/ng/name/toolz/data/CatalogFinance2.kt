package ng.name.toolz.data

import java.util.Locale
import kotlin.math.pow

/** The money gaps: revenue, payoff, inflation, overtime, ownership, yield and cost averaging. */

internal val financeTools2 = listOf(
    Tool(
        slug = "business-revenue", title = "Business Revenue", category = "finance",
        tagline = "Gross, refunds and net from units and price.",
        keywords = listOf("revenue", "turnover", "sales"),
        fields = listOf(
            field("units", "Units sold", FieldKind.DECIMAL, default = "240"),
            field("price", "Price per unit", FieldKind.DECIMAL, default = "15000"),
            field("refunds", "Refund rate (%)", FieldKind.DECIMAL, default = "4"),
            field("cost", "Cost per unit", FieldKind.DECIMAL, default = "9000"),
        ),
        compute = { input ->
            val units = input.num("units") ?: return@Tool err("How many units were sold?")
            val price = input.num("price") ?: return@Tool err("What is the price per unit?")
            val refunds = input.num("refunds") ?: 0.0
            val cost = input.num("cost") ?: 0.0
            if (units < 0 || price < 0 || refunds !in 0.0..100.0) return@Tool err("Units and price must be positive; refunds run from 0 to 100%.")
            val gross = units * price
            val refundValue = gross * refunds / 100
            val net = gross - refundValue
            val cogs = units * cost
            val profit = net - cogs
            ToolResult(
                "Net revenue",
                fmt(net),
                listOf(
                    "Gross" to fmt(gross),
                    "Refunds" to fmt(refundValue),
                    "Cost of goods" to fmt(cogs),
                    "Gross profit" to fmt(profit),
                    "Margin" to pct(if (net == 0.0) 0.0 else profit * 100 / net, 1),
                ),
                note = "Revenue is not profit: refunds and cost of goods both come off before you count it as yours.",
            )
        },
    ),
    Tool(
        slug = "currency-converter", title = "Currency Converter", category = "finance",
        tagline = "Convert with the rate your bank actually quotes.",
        keywords = listOf("currency", "exchange rate", "forex"),
        fields = listOf(
            field("amount", "Amount", FieldKind.DECIMAL, default = "100"),
            field("rate", "Rate: 1 FROM = ? TO", FieldKind.DECIMAL, default = "1550"),
            field("from", "From", FieldKind.TEXT, default = "USD"),
            field("to", "To", FieldKind.TEXT, default = "NGN"),
        ),
        compute = { input ->
            val amount = input.num("amount") ?: return@Tool err("Enter the amount.")
            val rate = input.num("rate") ?: return@Tool err("Enter the rate your bank shows.")
            if (rate <= 0) return@Tool err("A rate must be greater than zero.")
            val from = input.text("from").uppercase(Locale.UK).ifEmpty { "FROM" }
            val to = input.text("to").uppercase(Locale.UK).ifEmpty { "TO" }
            val converted = amount * rate
            ToolResult(
                "Converted",
                "${fmt(converted, 2)} $to",
                listOf(
                    "${fmt(amount, 2)} $from" to "${fmt(converted, 2)} $to",
                    "Rate used" to "1 $from = ${fmt(rate, 6)} $to",
                    "Reverse" to "1 $to = ${fmt(1 / rate, 6)} $from",
                    "Back again" to "${fmt(converted / rate, 2)} $from",
                ),
                note = "Toolz does not bundle exchange rates: they move every minute and a stale rate is worse than none. Type the rate your bank or card shows, and remember the bank's spread is where the real cost hides.",
            )
        },
    ),
    Tool(
        slug = "debt-payoff", title = "Debt Payoff", category = "finance",
        tagline = "How long a balance takes, and what the interest costs.",
        keywords = listOf("debt", "payoff", "interest"),
        fields = listOf(
            field("balance", "Balance", FieldKind.DECIMAL, default = "450000"),
            field("apr", "Annual rate (%)", FieldKind.DECIMAL, default = "24"),
            field("payment", "Monthly payment", FieldKind.DECIMAL, default = "25000"),
            field("extra", "Extra per month", FieldKind.DECIMAL, default = "0"),
        ),
        compute = { input ->
            val balance = input.num("balance") ?: return@Tool err("Enter the balance.")
            val apr = input.num("apr") ?: return@Tool err("Enter the annual rate.")
            val payment = (input.num("payment") ?: return@Tool err("Enter the monthly payment.")) + (input.num("extra") ?: 0.0)
            if (balance <= 0) return@Tool err("The balance must be positive.")
            if (payment <= 0) return@Tool err("The payment must be positive.")
            val monthlyRate = apr / 100 / 12
            if (monthlyRate > 0 && payment <= balance * monthlyRate) {
                return@Tool err("That payment does not cover the monthly interest, so the balance would never fall.")
            }
            var remaining = balance
            var months = 0
            var interestPaid = 0.0
            while (remaining > 0.005 && months < 1200) {
                val interest = remaining * monthlyRate
                interestPaid += interest
                remaining = remaining + interest - payment
                months++
            }
            if (months >= 1200) return@Tool err("Over 100 years to clear: the payment is too small.")
            val years = months / 12
            ToolResult(
                "$months months",
                "${years} years and ${months % 12} months at ${fmt(payment)} per month",
                listOf(
                    "Interest paid" to fmt(interestPaid),
                    "Total paid" to fmt(balance + interestPaid),
                    "Last payment" to fmt(maxOf(0.0, remaining + payment)),
                    "Interest as % of balance" to pct(interestPaid * 100 / balance, 1),
                ),
                note = "Paying a little extra every month attacks the principal directly; that is why the interest figure falls faster than the term.",
            )
        },
    ),
    Tool(
        slug = "inflation", title = "Inflation", category = "finance",
        tagline = "What money buys later, and what it is worth now.",
        keywords = listOf("inflation", "purchasing power", "future value"),
        fields = listOf(
            field("amount", "Amount today", FieldKind.DECIMAL, default = "100000"),
            field("rate", "Inflation per year (%)", FieldKind.DECIMAL, default = "12"),
            field("years", "Years", FieldKind.DECIMAL, default = "5"),
        ),
        compute = { input ->
            val amount = input.num("amount") ?: return@Tool err("Enter the amount.")
            val rate = input.num("rate") ?: return@Tool err("Enter the inflation rate.")
            val years = input.num("years") ?: return@Tool err("Enter the number of years.")
            if (amount < 0 || years <= 0) return@Tool err("Amount must be positive and years greater than zero.")
            val factor = (1 + rate / 100).pow(years)
            if (!factor.isFinite() || factor <= 0) return@Tool err("That rate and term are too extreme.")
            val futureCost = amount * factor
            val futurePower = amount / factor
            ToolResult(
                "Future cost",
                fmt(futureCost),
                listOf(
                    "What ${fmt(amount)} will buy then" to fmt(futurePower),
                    "Lost purchasing power" to pct((1 - 1 / factor) * 100, 1),
                    "Factor" to fmt(factor, 4),
                ),
                note = "Compounding runs against cash savings: an account paying less than inflation is losing value even as the number grows.",
            )
        },
    ),
    Tool(
        slug = "overtime", title = "Overtime Pay", category = "finance",
        tagline = "Regular hours, overtime and the multiplier.",
        keywords = listOf("overtime", "hourly", "pay"),
        fields = listOf(
            field("rate", "Hourly rate", FieldKind.DECIMAL, default = "3500"),
            field("regular", "Regular hours", FieldKind.DECIMAL, default = "160"),
            field("overtime", "Overtime hours", FieldKind.DECIMAL, default = "12"),
            field("multiplier", "Overtime multiplier", FieldKind.DECIMAL, default = "1.5"),
        ),
        compute = { input ->
            val rate = input.num("rate") ?: return@Tool err("Enter the hourly rate.")
            val regular = input.num("regular") ?: 0.0
            val overtime = input.num("overtime") ?: 0.0
            val multiplier = input.num("multiplier") ?: 1.5
            if (rate <= 0 || regular < 0 || overtime < 0 || multiplier <= 0) return@Tool err("Check the numbers: rate and multiplier must be positive.")
            val regularPay = rate * regular
            val overtimePay = rate * multiplier * overtime
            ToolResult(
                "Total pay",
                fmt(regularPay + overtimePay),
                listOf(
                    "Regular" to fmt(regularPay),
                    "Overtime" to fmt(overtimePay),
                    "Overtime hourly" to fmt(rate * multiplier),
                    "Hours" to fmt(regular + overtime, 1),
                ),
                note = "Time and a half is the common default, but check your contract or local labour law: the multiplier is a legal matter, not a preference.",
            )
        },
    ),
    Tool(
        slug = "ownership", title = "Percentage of Ownership", category = "finance",
        tagline = "The share an investment buys, before and after dilution.",
        keywords = listOf("equity", "ownership", "dilution"),
        fields = listOf(
            field("investment", "Investment", FieldKind.DECIMAL, default = "5000000"),
            field("valuation", "Post-money valuation", FieldKind.DECIMAL, default = "40000000"),
            field("options", "Option pool (%)", FieldKind.DECIMAL, default = "10"),
            field("dilution", "Future dilution (%)", FieldKind.DECIMAL, default = "20"),
        ),
        compute = { input ->
            val investment = input.num("investment") ?: return@Tool err("Enter the investment.")
            val valuation = input.num("valuation") ?: return@Tool err("Enter the post-money valuation.")
            val options = input.num("options") ?: 0.0
            val dilution = input.num("dilution") ?: 0.0
            if (valuation <= 0) return@Tool err("The valuation must be positive.")
            if (investment > valuation) return@Tool err("That investment is larger than the whole company's valuation.")
            if (options !in 0.0..100.0 || dilution !in 0.0..100.0) return@Tool err("Percentages run from 0 to 100.")
            val share = investment / valuation * 100
            val afterPool = share * (1 - options / 100)
            val afterDilution = afterPool * (1 - dilution / 100)
            ToolResult(
                pct(share, 2),
                "Before dilution · after the option pool ${pct(afterPool, 2)} · after future funding ${pct(afterDilution, 2)}",
                listOf(
                    "Shares bought" to pct(share, 2),
                    "Option pool effect" to pct(share - afterPool, 2),
                    "Future dilution effect" to pct(afterPool - afterDilution, 2),
                    "Price per 1%" to fmt(valuation / 100),
                ),
                note = "Percentages are of the fully diluted cap table. Get the real one before signing anything.",
            )
        },
    ),
    Tool(
        slug = "rental-yield", title = "Rental Yield", category = "finance",
        tagline = "Gross and net yield, with the costs that eat it.",
        keywords = listOf("rental yield", "property", "roi"),
        fields = listOf(
            field("price", "Purchase price", FieldKind.DECIMAL, default = "65000000"),
            field("rent", "Monthly rent", FieldKind.DECIMAL, default = "550000"),
            field("costs", "Annual costs", FieldKind.DECIMAL, default = "1800000"),
            field("vacancy", "Vacancy (%)", FieldKind.DECIMAL, default = "8"),
        ),
        compute = { input ->
            val price = input.num("price") ?: return@Tool err("Enter the purchase price.")
            val rent = input.num("rent") ?: return@Tool err("Enter the monthly rent.")
            val costs = input.num("costs") ?: 0.0
            val vacancy = input.num("vacancy") ?: 0.0
            if (price <= 0) return@Tool err("The price must be positive.")
            if (vacancy !in 0.0..100.0) return@Tool err("Vacancy runs from 0 to 100%.")
            val grossAnnual = rent * 12
            val collected = grossAnnual * (1 - vacancy / 100)
            val net = collected - costs
            ToolResult(
                "Net yield",
                pct(net * 100 / price, 2),
                listOf(
                    "Gross yield" to pct(grossAnnual * 100 / price, 2),
                    "Rent collected" to fmt(collected),
                    "Net income" to fmt(net),
                    "Monthly net" to fmt(net / 12),
                    "Payback" to (if (net <= 0) "never at this rent" else fmt(price / net, 1) + " years"),
                ),
                note = "Net yield ignores purchase costs, tax and major repairs. Treat it as a filter, then do the full model.",
            )
        },
    ),
    Tool(
        slug = "stock-average", title = "Stock Average Price", category = "finance",
        tagline = "Average cost across several buys, and the break-even price.",
        keywords = listOf("average price", "stocks", "cost basis"),
        fields = listOf(
            field("buys", "One buy per line: quantity, price", FieldKind.MULTILINE, default = "100, 250\n150, 230\n50, 260"),
            field("fees", "Total fees", FieldKind.DECIMAL, default = "1200"),
        ),
        compute = { input ->
            val rows = input["buys"].orEmpty().lines().mapNotNull { line ->
                val parts = line.split(',').map { it.trim() }.filter { it.isNotEmpty() }
                if (parts.size < 2) null else parts[0].toDoubleOrNull()?.let { quantity -> parts[1].toDoubleOrNull()?.let { price -> quantity to price } }
            }
            if (rows.isEmpty()) return@Tool err("Add lines like 100, 250 (quantity, price).")
            val fees = input.num("fees") ?: 0.0
            val totalQuantity = rows.sumOf { it.first }
            if (totalQuantity <= 0) return@Tool err("Total quantity must be greater than zero.")
            val totalCost = rows.sumOf { it.first * it.second } + fees
            val average = totalCost / totalQuantity
            val worst = rows.minOf { it.second }
            val best = rows.maxOf { it.second }
            ToolResult(
                "Average price",
                fmt(average, 4),
                listOf(
                    "Quantity" to fmt(totalQuantity, 4),
                    "Total cost" to fmt(totalCost),
                    "Break-even" to fmt(average, 4),
                    "Range bought" to "${fmt(worst)} – ${fmt(best)}",
                    "Gain at ${fmt(best)}" to fmt((best - average) * totalQuantity),
                ),
                note = "Fees are spread into the cost basis, which is why the average is slightly above the simple price average.",
            )
        },
    ),
)
