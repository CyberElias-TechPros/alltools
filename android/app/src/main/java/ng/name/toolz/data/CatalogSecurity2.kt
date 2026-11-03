package ng.name.toolz.data

import java.security.SecureRandom
import java.util.Base64
import java.util.Locale
import javax.crypto.Cipher
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.PBEKeySpec
import javax.crypto.spec.SecretKeySpec

/**
 * Security gaps: two policy templates, a cookie checklist, a real AES demo that
 * round-trips on device, and link hygiene. The policy generators produce a
 * skeleton — they say out loud that they are not legal advice.
 */

private const val GCM_TAG_BITS = 128
private const val SALT_BYTES = 16
private const val IV_BYTES = 12
private const val ITERATIONS = 120_000

private fun deriveKey(passphrase: CharArray, salt: ByteArray): SecretKeySpec {
    val spec = PBEKeySpec(passphrase, salt, ITERATIONS, 256)
    val factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
    val encoded = factory.generateSecret(spec).encoded
    return SecretKeySpec(encoded, "AES")
}

internal fun encryptText(plain: String, passphrase: String): String {
    val random = SecureRandom()
    val salt = ByteArray(SALT_BYTES).also { random.nextBytes(it) }
    val iv = ByteArray(IV_BYTES).also { random.nextBytes(it) }
    val key = deriveKey(passphrase.toCharArray(), salt)
    val cipher = Cipher.getInstance("AES/GCM/NoPadding")
    cipher.init(Cipher.ENCRYPT_MODE, key, GCMParameterSpec(GCM_TAG_BITS, iv))
    val encrypted = cipher.doFinal(plain.toByteArray(Charsets.UTF_8))
    val combined = salt + iv + encrypted
    return Base64.getEncoder().encodeToString(combined)
}

internal fun decryptText(payload: String, passphrase: String): String {
    val combined = Base64.getDecoder().decode(payload.trim())
    if (combined.size <= SALT_BYTES + IV_BYTES) throw IllegalArgumentException("That payload is too short to be a Toolz message.")
    val salt = combined.copyOfRange(0, SALT_BYTES)
    val iv = combined.copyOfRange(SALT_BYTES, SALT_BYTES + IV_BYTES)
    val data = combined.copyOfRange(SALT_BYTES + IV_BYTES, combined.size)
    val key = deriveKey(passphrase.toCharArray(), salt)
    val cipher = Cipher.getInstance("AES/GCM/NoPadding")
    cipher.init(Cipher.DECRYPT_MODE, key, GCMParameterSpec(GCM_TAG_BITS, iv))
    return String(cipher.doFinal(data), Charsets.UTF_8)
}

internal val securityTools2 = listOf(
    Tool(
        slug = "privacy-policy", title = "Privacy Policy Draft", category = "security",
        tagline = "A skeleton policy you then have reviewed.",
        keywords = listOf("privacy policy", "gdpr", "legal"),
        fields = listOf(
            field("company", "Company or person", FieldKind.TEXT, default = "Toolz"),
            field("site", "Website", FieldKind.TEXT, default = "https://toolz.name.ng"),
            field("email", "Contact email", FieldKind.TEXT, default = "hello@toolz.name.ng"),
            field("data", "What you collect, one per line", FieldKind.MULTILINE, default = "Nothing: every tool runs in the browser\nAnonymous page counts, if analytics is enabled"),
            field("third", "Third parties, one per line", FieldKind.MULTILINE, default = "Google AdSense, for advertising\nOur hosting provider, for server logs"),
        ),
        compute = { input ->
            val company = input.text("company")
            val site = input.text("site")
            val email = input.text("email")
            if (company.isEmpty() || site.isEmpty()) return@Tool err("A company name and website are required.")
            val data = input["data"].orEmpty().lines().map { it.trim() }.filter { it.isNotEmpty() }
            val third = input["third"].orEmpty().lines().map { it.trim() }.filter { it.isNotEmpty() }
            val draft = buildString {
                appendLine("# Privacy policy for $site")
                appendLine()
                appendLine("Last updated: ${java.time.LocalDate.now()}")
                appendLine()
                appendLine("## Who we are")
                appendLine("$company runs $site. You can reach us at $email.")
                appendLine()
                appendLine("## What we collect")
                if (data.isEmpty()) appendLine("Nothing. You do not need an account to use the site.") else data.forEach { appendLine("- $it") }
                appendLine()
                appendLine("## Who else sees data")
                if (third.isEmpty()) appendLine("No third parties.") else third.forEach { appendLine("- $it") }
                appendLine()
                appendLine("## Your rights")
                appendLine("You can ask what we hold about you, ask for a copy, or ask us to delete it. Write to $email and we will answer within 30 days.")
                appendLine()
                appendLine("## Cookies")
                appendLine("Cookies are only set where they are described on the cookie page, and advertising cookies are only used with consent where the law requires it.")
                appendLine()
                append("## Changes\nIf this policy changes we will update the date at the top.")
            }
            ToolResult(
                "Draft policy",
                draft,
                listOf("Sections" to "6", "Words" to wordsOf(draft).size.toString()),
                note = "A starting skeleton, not legal advice. Your regulator's rules, the data you actually collect and your contracts decide what is lawful — have a qualified person read it before publishing.",
            )
        },
    ),
    Tool(
        slug = "terms-conditions", title = "Terms Draft", category = "security",
        tagline = "The headings every terms page needs, filled in.",
        keywords = listOf("terms", "conditions", "legal"),
        fields = listOf(
            field("company", "Company or person", FieldKind.TEXT, default = "Toolz"),
            field("site", "Website", FieldKind.TEXT, default = "https://toolz.name.ng"),
            field("law", "Governing law", FieldKind.TEXT, default = "the Federal Republic of Nigeria"),
            field("service", "What the service is", FieldKind.TEXT, default = "free browser-based calculators and converters"),
            field("email", "Contact email", FieldKind.TEXT, default = "hello@toolz.name.ng"),
        ),
        compute = { input ->
            val company = input.text("company")
            val site = input.text("site")
            if (company.isEmpty() || site.isEmpty()) return@Tool err("A company name and website are required.")
            val service = input.text("service").ifEmpty { "the service offered on this site" }
            val law = input.text("law").ifEmpty { "the laws that apply where the company is registered" }
            val draft = buildString {
                appendLine("# Terms of use")
                appendLine()
                appendLine("Last updated: ${java.time.LocalDate.now()}")
                appendLine()
                appendLine("## 1. Using $site")
                appendLine("$company provides $service. Use it lawfully, and do not attempt to break, overload or reverse-engineer it in a way that harms other users.")
                appendLine()
                appendLine("## 2. No professional advice")
                appendLine("Results are estimates produced by formulas. They are not legal, medical, tax or financial advice. Check anything important with a qualified professional.")
                appendLine()
                appendLine("## 3. Your content")
                appendLine("You keep ownership of anything you paste in. Since the tools run on your device, we do not receive it.")
                appendLine()
                appendLine("## 4. Availability")
                appendLine("The service is provided as is. We do not promise it will always be available or that every result is error-free.")
                appendLine()
                appendLine("## 5. Liability")
                appendLine("To the extent the law allows, $company is not liable for indirect losses arising from use of the site.")
                appendLine()
                appendLine("## 6. Governing law")
                appendLine("These terms are governed by the laws of $law.")
                appendLine()
                append("## 7. Contact\nQuestions: ${input.text("email")}")
            }
            ToolResult(
                "Draft terms",
                draft,
                listOf("Sections" to "7", "Words" to wordsOf(draft).size.toString()),
                note = "A skeleton with the right headings, not legal advice. Consumer law in your market may give users rights this draft cannot sign away — have it reviewed.",
            )
        },
    ),
    Tool(
        slug = "cookie-checklist", title = "Cookie Checklist", category = "security",
        tagline = "What your cookie notice still needs.",
        keywords = listOf("cookies", "consent", "gdpr"),
        fields = listOf(
            field("essential", "Sets essential cookies", FieldKind.TOGGLE, default = "true"),
            field("analytics", "Sets analytics cookies", FieldKind.TOGGLE, default = "true"),
            field("ads", "Sets advertising cookies", FieldKind.TOGGLE, default = "true"),
            field("banner", "Consent banner with a real reject button", FieldKind.TOGGLE, default = "false"),
            field("withdraw", "Way to change consent later", FieldKind.TOGGLE, default = "false"),
            field("page", "Cookie page describing each cookie", FieldKind.TOGGLE, default = "false"),
            field("privacy", "Privacy policy linked from every page", FieldKind.TOGGLE, default = "true"),
        ),
        compute = { input ->
            val items = mutableListOf<Pair<String, Boolean>>()
            items += "Cookie page names each cookie, its purpose and its lifetime" to input.flag("page")
            if (input.flag("ads") || input.flag("analytics")) {
                items += "Consent asked before non-essential cookies are set (a real reject button, not just “OK”)" to input.flag("banner")
                items += "Consent can be withdrawn as easily as it was given" to input.flag("withdraw")
            }
            items += "Privacy policy linked from every page" to input.flag("privacy")
            if (input.flag("analytics")) items += "Analytics configured to anonymise or minimise what is collected" to true
            if (input.flag("essential")) items += "Essential cookies listed separately and set without consent" to true
            val missing = items.filter { !it.second }.map { it.first }
            ToolResult(
                if (missing.isEmpty()) "Complete" else "${missing.size} gap${if (missing.size == 1) "" else "s"}",
                if (missing.isEmpty()) "Everything on the list is in place." else missing.joinToString("\n") { "· $it" },
                listOf("Checks" to items.size.toString(), "Done" to (items.size - missing.size).toString()),
                note = "Which rules bind you depends on where your visitors are. Under GDPR-style rules, non-essential cookies need prior consent; check your regulator's current guidance.",
            )
        },
    ),
    Tool(
        slug = "text-encryption", title = "Text Encryption", category = "security",
        tagline = "AES-256-GCM with a passphrase, encrypted on your device.",
        keywords = listOf("encrypt", "aes", "password"),
        fields = listOf(
            field("mode", "Mode", FieldKind.SELECT, default = "Encrypt", options = listOf("Encrypt", "Decrypt")),
            field("passphrase", "Passphrase", FieldKind.TEXT, default = "correct horse battery"),
            field("text", "Text to encrypt, or the payload to decrypt", FieldKind.MULTILINE, default = "Meet me at 6."),
        ),
        compute = { input ->
            val passphrase = input.text("passphrase")
            val text = input["text"].orEmpty().trim()
            if (passphrase.length < 8) return@Tool err("Use a passphrase of at least 8 characters.")
            if (text.isEmpty()) return@Tool err("Type something to encrypt.")
            if (input["mode"] == "Decrypt") {
                val plain = runCatching { decryptText(text, passphrase) }.getOrElse {
                    return@Tool err("Could not decrypt: wrong passphrase, or the payload was altered.")
                }
                return@Tool ToolResult(
                    "Decrypted",
                    plain,
                    listOf("Cipher" to "AES-256-GCM", "Key derivation" to "PBKDF2-HMAC-SHA256, $ITERATIONS rounds"),
                    note = "If this looks like gibberish, the passphrase is wrong — GCM refuses to return tampered data.",
                )
            }
            val payload = encryptText(text, passphrase)
            ToolResult(
                "Encrypted",
                payload,
                listOf(
                    "Cipher" to "AES-256-GCM",
                    "Key derivation" to "PBKDF2-HMAC-SHA256, $ITERATIONS rounds",
                    "Payload" to "${payload.length} characters",
                ),
                note = "The salt and IV are random each time, so the same message never produces the same payload. Losing the passphrase loses the message: there is no recovery.",
            )
        },
    ),
    Tool(
        slug = "url-safety", title = "URL Safety Check", category = "security",
        tagline = "Red flags in a link, without opening it.",
        keywords = listOf("phishing", "url", "safety"),
        fields = listOf(field("url", "Link", FieldKind.TEXT, default = "https://toolz-name.ng.account-check.example/login")),
        compute = { input ->
            val raw = input.text("url")
            if (raw.isEmpty()) return@Tool err("Paste the link you were sent.")
            val lower = raw.lowercase(Locale.UK)
            val flags = mutableListOf<String>()
            if (!lower.startsWith("https://")) flags += "not https"
            if (raw.contains('@')) flags += "an @ in the address hides the real destination"
            if (lower.contains("xn--")) flags += "punycode domain (xn--) can imitate letters from another alphabet"
            val host = Regex("^[a-z]+://([^/?#]+)").find(lower)?.groupValues?.get(1)?.substringBefore(':') ?: ""
            if (host.count { it == '.' } >= 4) flags += "unusually many subdomains"
            if (host.matches(Regex("^\\d+(\\.\\d+){3}$"))) flags += "raw IP address instead of a domain"
            if (host.length > 30) flags += "very long hostname"
            if (lower.contains("login") || lower.contains("verify") || lower.contains("account")) flags += "asks you to log in or verify"
            if (lower.contains("%")) flags += "percent-encoded characters can disguise the path"
            if (lower.contains("..")) flags += "path traversal in the link"
            if (Regex("[а-яα-ω]").containsMatchIn(lower)) flags += "looks like a letter from another alphabet in the address"
            val verdict = when {
                flags.size >= 3 -> "Treat as hostile until proven otherwise"
                flags.size == 2 -> "Suspicious"
                flags.size == 1 -> "One thing to check"
                else -> "No syntax red flags"
            }
            ToolResult(
                verdict,
                "$host",
                listOf(
                    "Red flags" to (if (flags.isEmpty()) "none found" else flags.joinToString("; ")),
                    "Scheme" to (if (lower.startsWith("https://")) "https" else "not https"),
                    "Checks run" to "9",
                ),
                note = "This reads the text of the link only. It cannot know whether a site is malicious — check the domain yourself and never enter credentials you did not initiate.",
            )
        },
    ),
)
