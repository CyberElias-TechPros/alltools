package ng.name.toolz.data

import java.util.Locale

/**
 * The business generators that only existed on the website: letters, names,
 * slogans, signatures, campaigns and the costing maths that goes with them.
 * Generated text is deterministic, so the same inputs always give the same
 * draft.
 */

private val SPAM_WORDS = listOf(
    "free", "act now", "urgent", "guarantee", "risk-free", "100%", "cash", "winner",
    "limited time", "click here", "buy now", "no obligation", "credit", "offer",
)

internal val businessTools2 = listOf(
    Tool(
        slug = "business-letter", title = "Business Letter", category = "business",
        tagline = "A correctly blocked business letter from your details.",
        keywords = listOf("letter", "formal", "correspondence"),
        fields = listOf(
            field("sender", "Your name and address", FieldKind.TEXT, default = "Ada Obi, 14 Marina Road, Lagos"),
            field("recipient", "Recipient", FieldKind.TEXT, default = "The Manager, Harbour Supplies Ltd"),
            field("subject", "Subject", FieldKind.TEXT, default = "Late delivery of order 4471"),
            field("points", "Paragraph, one per line", FieldKind.MULTILINE, default = "Order 4471 was due on 12 May and has not arrived.\nThe delay has stopped work on two sites.\nPlease confirm a delivery date within five working days."),
            field("signoff", "Sign-off", FieldKind.TEXT, default = "Yours faithfully"),
        ),
        compute = { input ->
            val sender = input.text("sender")
            val recipient = input.text("recipient")
            val subject = input.text("subject")
            val points = input["points"].orEmpty().lines().map { it.trim() }.filter { it.isNotEmpty() }
            if (subject.isEmpty() || points.isEmpty()) return@Tool err("A subject and at least one paragraph are needed.")
            val letter = buildString {
                appendLine(sender)
                appendLine()
                appendLine(java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("d MMMM yyyy")))
                appendLine()
                appendLine(recipient)
                appendLine()
                appendLine("Dear Sir or Madam,")
                appendLine()
                appendLine("Re: $subject")
                appendLine()
                points.forEach { appendLine(it); appendLine() }
                appendLine(input.text("signoff").ifEmpty { "Yours faithfully" } + ",")
                appendLine()
                appendLine(sender.substringBefore(','))
            }.trim()
            ToolResult("Letter", letter, listOf("Paragraphs" to points.size.toString()))
        },
    ),
    Tool(
        slug = "business-name", title = "Business Name", category = "business",
        tagline = "Name directions to test, from one keyword.",
        keywords = listOf("naming", "brand", "company name"),
        fields = listOf(
            field("keyword", "Core word", FieldKind.TEXT, default = "coffee"),
            field("style", "Style", FieldKind.SELECT, default = "Modern", options = listOf("Modern", "Classic", "Playful")),
        ),
        compute = { input ->
            val keyword = input.text("keyword")
            if (keyword.isEmpty()) return@Tool err("Enter the word the business is about.")
            val core = keyword.replace(" ", "").replaceFirstChar { it.uppercase(Locale.UK) }
            val options = when (input["style"]) {
                "Classic" -> listOf(
                    "$core & Co", "The $core House", "$core Trading", "$core Partners",
                    "$core Group", "Standard $core", "$core Brothers", "$core & Sons",
                )
                "Playful" -> listOf(
                    "${core}oo", "Snappy $core", "$core Tonic", "Wild $core",
                    "$core Club", "Little $core", "${core} Beans", "$core Parade",
                )
                else -> listOf(
                    "${core}ly", "${core}Hub", "Hey $core", "${core}Lab", "${core}Stack",
                    "${core}Nest", "${core}Flow", "${core}Works",
                )
            }
            ToolResult(
                input["style"] ?: "Modern", options.joinToString("\n"),
                listOf("Directions" to options.size.toString()),
                note = "Check the name is free on Companies House or the CAC, the .com or .ng domain, and the social handles before you fall in love with it.",
            )
        },
    ),
    Tool(
        slug = "content-calendar", title = "Content Calendar", category = "business",
        tagline = "Weeks of posts built from your content pillars.",
        keywords = listOf("content calendar", "social media", "planning"),
        fields = listOf(
            field("pillars", "Pillars, one per line", FieldKind.MULTILINE, default = "How-to\nCustomer story\nProduct news"),
            field("weeks", "Weeks", FieldKind.NUMBER, default = "4"),
            field("cadence", "Posts per week", FieldKind.SELECT, default = "3", options = listOf("2", "3", "5")),
        ),
        compute = { input ->
            val pillars = input["pillars"].orEmpty().lines().map { it.trim() }.filter { it.isNotEmpty() }
            val weeks = (input.num("weeks") ?: 0.0).toInt()
            val cadence = input["cadence"]?.toIntOrNull() ?: 3
            if (pillars.isEmpty()) return@Tool err("Add at least one pillar.")
            if (weeks <= 0) return@Tool err("Enter at least one week.")
            val days = when (cadence) {
                2 -> listOf("Tue", "Thu")
                5 -> listOf("Mon", "Tue", "Wed", "Thu", "Fri")
                else -> listOf("Mon", "Wed", "Fri")
            }
            val plan = buildString {
                for (week in 1..weeks) {
                    appendLine("Week $week")
                    days.forEachIndexed { index, day ->
                        val pillar = pillars[((week - 1) * days.size + index) % pillars.size]
                        appendLine("  $day · $pillar")
                    }
                }
            }.trimEnd()
            ToolResult("$weeks weeks", plan, listOf("Pillars" to pillars.size.toString(), "Posts" to (weeks * days.size).toString()))
        },
    ),
    Tool(
        slug = "email-signature", title = "Email Signature", category = "business",
        tagline = "A clean HTML signature that survives Gmail and Outlook.",
        keywords = listOf("signature", "email", "html"),
        fields = listOf(
            field("name", "Name", FieldKind.TEXT, default = "Ada Obi"),
            field("role", "Role", FieldKind.TEXT, default = "Founder"),
            field("company", "Company", FieldKind.TEXT, default = "Toolz"),
            field("phone", "Phone", FieldKind.TEXT, default = "+234 800 000 0000"),
            field("email", "Email", FieldKind.TEXT, default = "hello@toolz.name.ng"),
            field("site", "Website", FieldKind.TEXT, default = "https://toolz.name.ng"),
        ),
        compute = { input ->
            val name = input.text("name")
            if (name.isEmpty()) return@Tool err("A name is required.")
            val html = """
                <table cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#15161a">
                  <tr>
                    <td style="padding-right:16px;border-right:2px solid #d64e18">
                      <strong>$name</strong><br>
                      <span style="color:#4a4b52">${input.text("role")}</span><br>
                      <span style="color:#4a4b52">${input.text("company")}</span>
                    </td>
                    <td style="padding-left:16px;color:#4a4b52">
                      <a href="mailto:${input.text("email")}" style="color:#d64e18;text-decoration:none">${input.text("email")}</a><br>
                      <a href="tel:${input.text("phone").replace(" ", "")}" style="color:#15161a;text-decoration:none">${input.text("phone")}</a><br>
                      <a href="${input.text("site")}" style="color:#15161a;text-decoration:none">${input.text("site").removePrefix("https://").removePrefix("http://")}</a>
                    </td>
                  </tr>
                </table>
            """.trimIndent()
            ToolResult("HTML", html, listOf("Lines" to html.lines().size.toString()), note = "Use a table, not flexbox: Outlook ignores most modern CSS.")
        },
    ),
    Tool(
        slug = "email-subject-analyzer", title = "Subject Line Analyzer", category = "business",
        tagline = "Length, spam triggers and shouting, scored.",
        keywords = listOf("subject line", "email", "open rate"),
        fields = listOf(field("subject", "Subject", FieldKind.TEXT, default = "FREE guide: act now to double your sales")),
        compute = { input ->
            val subject = input.text("subject")
            if (subject.isEmpty()) return@Tool err("Type a subject line.")
            val lower = subject.lowercase(Locale.UK)
            val spam = SPAM_WORDS.filter { lower.contains(it) }
            val shouting = subject.split(" ").count { it.length > 2 && it.all { c -> c.isUpperCase() || !c.isLetter() } && it.any { c -> c.isLetter() } }
            val emoji = subject.count { it.code > 0x2000 }
            var score = 100
            if (subject.length > 60) score -= 20
            if (subject.length < 20) score -= 10
            score -= spam.size * 15
            score -= shouting * 10
            if (subject.contains('!')) score -= 5
            val verdict = when {
                score >= 80 -> "Strong"
                score >= 55 -> "Workable"
                else -> "Likely to be filtered or ignored"
            }
            ToolResult(
                "$score/100", verdict,
                listOf(
                    "Characters" to subject.length.toString(),
                    "Spam triggers" to if (spam.isEmpty()) "none" else spam.joinToString(", "),
                    "Shouted words" to shouting.toString(),
                    "Emoji" to emoji.toString(),
                ),
                note = "Aim for 35–50 characters so the whole line shows on a phone lock screen.",
            )
        },
    ),
    Tool(
        slug = "hashtag-generator", title = "Hashtag Generator", category = "business",
        tagline = "Clean hashtags from a topic, with the platform limit marked.",
        keywords = listOf("hashtags", "instagram", "social"),
        fields = listOf(
            field("topics", "Topics, one per line", FieldKind.MULTILINE, default = "small business\nlagos\naccounting"),
            field("platform", "Platform", FieldKind.SELECT, default = "Instagram", options = listOf("Instagram", "TikTok", "LinkedIn", "X")),
        ),
        compute = { input ->
            val topics = input["topics"].orEmpty().lines().map { it.trim() }.filter { it.isNotEmpty() }
            if (topics.isEmpty()) return@Tool err("Add a topic or two.")
            fun tag(text: String): String {
                val joined = text.lowercase(Locale.UK).split(Regex("[^a-z0-9]+"))
                    .filter { it.isNotEmpty() }
                    .joinToString("") { part -> part.replaceFirstChar { it.uppercase(Locale.UK) } }
                return if (joined.isEmpty()) "#" else "#$joined"
            }
            val tags = topics.flatMap { topic ->
                val parts = topic.split(Regex("\\s+")).filter { it.isNotEmpty() }
                val lastWord = parts.lastOrNull() ?: topic
                val firstWord = parts.firstOrNull() ?: topic
                listOf(tag(topic), tag(lastWord) + "Tips", tag(firstWord) + "Ng")
            }.distinct()
            val limit = when (input["platform"]) {
                "TikTok" -> 5
                "LinkedIn" -> 3
                "X" -> 2
                else -> 10
            }
            ToolResult(
                "${tags.size} hashtags", tags.joinToString(" "),
                listOf("Platform" to (input["platform"] ?: "Instagram"), "Suggested maximum" to "$limit"),
                note = "Specific beats generic: #LagosAccountant out-performs #business every time.",
            )
        },
    ),
    Tool(
        slug = "marketing-budget", title = "Marketing Budget", category = "business",
        tagline = "Split a budget across channels by goal.",
        keywords = listOf("budget", "marketing", "channels"),
        fields = listOf(
            field("budget", "Budget", FieldKind.DECIMAL, default = "500000"),
            field("goal", "Goal", FieldKind.SELECT, default = "Leads", options = listOf("Awareness", "Leads", "Sales")),
            field("months", "Months", FieldKind.NUMBER, default = "3"),
        ),
        compute = { input ->
            val budget = input.num("budget") ?: return@Tool err("Enter the budget.")
            val months = (input.num("months") ?: 1.0).toInt().coerceAtLeast(1)
            if (budget <= 0) return@Tool err("Budget must be positive.")
            val split = when (input["goal"]) {
                "Awareness" -> listOf("Paid social" to 0.45, "Content" to 0.25, "Search" to 0.20, "Measurement" to 0.10)
                "Sales" -> listOf("Search" to 0.40, "Retargeting" to 0.25, "Paid social" to 0.25, "Measurement" to 0.10)
                else -> listOf("Search" to 0.35, "Paid social" to 0.30, "Content" to 0.25, "Measurement" to 0.10)
            }
            val details = split.map { (channel, share) -> channel to fmt(budget * share) }
            ToolResult(
                fmt(budget / months) + " per month",
                details.joinToString("\n") { (channel, amount) -> "$channel · $amount" } + "\n\nTotal · ${fmt(budget)}",
                listOf("Goal" to (input["goal"] ?: "Leads"), "Months" to months.toString()),
                note = "Hold 10% back for the channel that surprises you.",
            )
        },
    ),
    Tool(
        slug = "meeting-cost", title = "Meeting Cost", category = "business",
        tagline = "What this meeting costs in salary, per minute.",
        keywords = listOf("meeting", "cost", "time"),
        fields = listOf(
            field("attendees", "Attendees", FieldKind.NUMBER, default = "6"),
            field("rate", "Average hourly cost", FieldKind.DECIMAL, default = "9000"),
            field("minutes", "Minutes", FieldKind.NUMBER, default = "45"),
        ),
        compute = { input ->
            val attendees = (input.num("attendees") ?: 0.0).toInt()
            val rate = input.num("rate") ?: 0.0
            val minutes = (input.num("minutes") ?: 0.0).toInt()
            if (attendees <= 0 || minutes <= 0) return@Tool err("Attendees and minutes must be positive.")
            val cost = attendees * rate * minutes / 60.0
            ToolResult(
                "Meeting cost",
                fmt(cost),
                listOf(
                    "Per minute" to fmt(cost / minutes),
                    "Person-hours" to fmt(attendees * minutes / 60.0, 2),
                    "Yearly, if weekly" to fmt(cost * 46),
                ),
                note = "Halving the attendee list is usually cheaper than halving the agenda.",
            )
        },
    ),
    Tool(
        slug = "project-cost", title = "Project Cost", category = "business",
        tagline = "Labour, overhead and contingency in one number.",
        keywords = listOf("project cost", "estimate", "quote"),
        fields = listOf(
            field("hours", "Hours", FieldKind.DECIMAL, default = "120"),
            field("rate", "Hourly rate", FieldKind.DECIMAL, default = "9500"),
            field("overhead", "Overhead (%)", FieldKind.DECIMAL, default = "15"),
            field("contingency", "Contingency (%)", FieldKind.DECIMAL, default = "10"),
            field("materials", "Materials", FieldKind.DECIMAL, default = "80000"),
        ),
        compute = { input ->
            val hours = input.num("hours") ?: return@Tool err("Enter the hours.")
            val rate = input.num("rate") ?: return@Tool err("Enter the hourly rate.")
            val materials = input.num("materials") ?: 0.0
            val overhead = input.num("overhead") ?: 0.0
            val contingency = input.num("contingency") ?: 0.0
            if (hours < 0 || rate < 0) return@Tool err("Hours and rate cannot be negative.")
            val labour = hours * rate
            val subtotal = labour + materials
            val overheadCost = subtotal * overhead / 100
            val contingencyCost = (subtotal + overheadCost) * contingency / 100
            ToolResult(
                "Project total",
                fmt(subtotal + overheadCost + contingencyCost),
                listOf(
                    "Labour" to fmt(labour),
                    "Materials" to fmt(materials),
                    "Overhead" to fmt(overheadCost),
                    "Contingency" to fmt(contingencyCost),
                ),
                note = "Quote the total, but show the workings: clients trust a visible contingency more than a round number.",
            )
        },
    ),
    Tool(
        slug = "proposal-template", title = "Proposal Template", category = "business",
        tagline = "A one-page proposal you can edit and send.",
        keywords = listOf("proposal", "quote", "client"),
        fields = listOf(
            field("client", "Client", FieldKind.TEXT, default = "Harbour Supplies Ltd"),
            field("project", "Project", FieldKind.TEXT, default = "Stock control dashboard"),
            field("scope", "Deliverables, one per line", FieldKind.MULTILINE, default = "Dashboard with live stock levels\nWeekly email summary\nTwo training sessions"),
            field("price", "Price", FieldKind.DECIMAL, default = "450000"),
            field("weeks", "Delivery (weeks)", FieldKind.NUMBER, default = "6"),
        ),
        compute = { input ->
            val client = input.text("client")
            val project = input.text("project")
            val scope = input["scope"].orEmpty().lines().map { it.trim() }.filter { it.isNotEmpty() }
            val price = input.num("price") ?: 0.0
            val weeks = (input.num("weeks") ?: 0.0).toInt()
            if (client.isEmpty() || project.isEmpty() || scope.isEmpty()) return@Tool err("Client, project and at least one deliverable are required.")
            val text = buildString {
                appendLine("Proposal: $project")
                appendLine("Prepared for $client")
                appendLine()
                appendLine("What you get")
                scope.forEach { appendLine("· $it") }
                appendLine()
                appendLine("Delivery")
                appendLine("$weeks weeks from written approval, in weekly increments you can review.")
                appendLine()
                appendLine("Investment")
                appendLine("${fmt(price)} total. 50% on approval, 50% on delivery.")
                appendLine()
                appendLine("Not included")
                appendLine("Content writing, photography and anything not listed above.")
                appendLine()
                append("Valid for 30 days from the date above.")
            }
            ToolResult("Proposal", text, listOf("Deliverables" to scope.size.toString()))
        },
    ),
    Tool(
        slug = "qr-business-card", title = "QR Business Card", category = "business",
        tagline = "A vCard inside a QR code you can show or print.",
        keywords = listOf("qr", "vcard", "contact"),
        fields = listOf(
            field("name", "Name", FieldKind.TEXT, default = "Ada Obi"),
            field("title", "Title", FieldKind.TEXT, default = "Founder"),
            field("company", "Company", FieldKind.TEXT, default = "Toolz"),
            field("phone", "Phone", FieldKind.TEXT, default = "+2348000000000"),
            field("email", "Email", FieldKind.TEXT, default = "hello@toolz.name.ng"),
            field("site", "Website", FieldKind.TEXT, default = "https://toolz.name.ng"),
        ),
        compute = { input ->
            val name = input.text("name")
            if (name.isEmpty()) return@Tool err("A name is required.")
            val card = buildString {
                appendLine("BEGIN:VCARD")
                appendLine("VERSION:3.0")
                appendLine("FN:$name")
                appendLine("ORG:${input.text("company")}")
                appendLine("TITLE:${input.text("title")}")
                appendLine("TEL;TYPE=CELL:${input.text("phone")}")
                appendLine("EMAIL:${input.text("email")}")
                appendLine("URL:${input.text("site")}")
                append("END:VCARD")
            }
            val qr = qrBlocks(card, 33)
            ToolResult(
                "Scan-ready vCard",
                qr ?: "QR could not be rendered for that text.",
                listOf("Payload" to "${card.length} characters"),
                note = card,
            )
        },
    ),
    Tool(
        slug = "slogan-generator", title = "Slogan Generator", category = "business",
        tagline = "Lines to test, built from what the brand stands for.",
        keywords = listOf("slogan", "tagline", "brand"),
        fields = listOf(
            field("brand", "Brand", FieldKind.TEXT, default = "Toolz"),
            field("benefit", "Benefit", FieldKind.TEXT, default = "answers in a second"),
            field("audience", "Audience", FieldKind.TEXT, default = "busy people"),
        ),
        compute = { input ->
            val brand = input.text("brand")
            val benefit = input.text("benefit")
            val audience = input.text("audience")
            if (brand.isEmpty() || benefit.isEmpty()) return@Tool err("A brand and a benefit are needed.")
            val lines = listOf(
                "$brand. $benefit.",
                "For $audience who need it now.",
                "$benefit. Every time.",
                "Small tool. Big difference.",
                "$brand — because waiting is not a feature.",
                "Everything you need. Nothing you don't.",
            )
            ToolResult("${lines.size} lines", lines.joinToString("\n"), note = "Pick the one you can say out loud without feeling silly. Then test it on ten customers.")
        },
    ),
    Tool(
        slug = "caption-formatter", title = "Caption Formatter", category = "business",
        tagline = "Line breaks, hashtags and the character count per platform.",
        keywords = listOf("caption", "social media", "formatting"),
        fields = listOf(
            field("text", "Caption", FieldKind.MULTILINE, default = "We rebuilt the VAT calculator this week. It now handles reverse VAT in one tap. Try it and tell us what breaks."),
            field("tags", "Hashtags", FieldKind.TEXT, default = "#toolz #vat #smallbusiness"),
            field("platform", "Platform", FieldKind.SELECT, default = "Instagram", options = listOf("Instagram", "X", "LinkedIn", "TikTok")),
        ),
        compute = { input ->
            val body = input["text"].orEmpty().trim()
            if (body.isEmpty()) return@Tool err("Write a caption first.")
            val tags = input.text("tags")
            val limit = when (input["platform"]) {
                "X" -> 280
                "Instagram", "TikTok" -> 2200
                else -> 3000
            }
            val caption = buildString {
                append(body.lines().joinToString("\n\n") { it.trim() })
                if (tags.isNotEmpty()) {
                    appendLine()
                    appendLine()
                    append(tags)
                }
            }
            ToolResult(
                "${caption.length} characters",
                caption,
                listOf(
                    "Platform" to (input["platform"] ?: "Instagram"),
                    "Limit" to limit.toString(),
                    "Status" to if (caption.length <= limit) "fits" else "over by ${caption.length - limit}",
                ),
                note = "The first 125 characters show before “more”, so put the point there.",
            )
        },
    ),
)
