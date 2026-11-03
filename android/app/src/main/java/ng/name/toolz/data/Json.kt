package ng.name.toolz.data

/**
 * Minimal, strict JSON reader/writer for the formatter tool.
 *
 * Kept in-house so the app has no extra dependency for one screen. Parsing
 * throws IllegalArgumentException on anything malformed, which the tool turns
 * into a readable message.
 */
object Json {

    fun parse(text: String): Any? {
        val parser = Parser(text)
        val value = parser.readValue()
        parser.skipWhitespace()
        if (!parser.atEnd()) throw IllegalArgumentException("Unexpected trailing content")
        return value
    }

    fun write(value: Any?, pretty: Boolean): String {
        val out = StringBuilder()
        writeValue(value, out, pretty, 0)
        return out.toString()
    }

    private fun writeValue(value: Any?, out: StringBuilder, pretty: Boolean, depth: Int) {
        when (value) {
            null -> out.append("null")
            is String -> out.append(quote(value))
            is Boolean -> out.append(value.toString())
            is Number -> out.append(number(value))
            is Map<*, *> -> {
                if (value.isEmpty()) {
                    out.append("{}")
                    return
                }
                out.append('{')
                val entries = value.entries.toList()
                entries.forEachIndexed { index, entry ->
                    if (pretty) {
                        out.append('\n').append("  ".repeat(depth + 1))
                    }
                    out.append(quote(entry.key.toString())).append(':')
                    if (pretty) out.append(' ')
                    writeValue(entry.value, out, pretty, depth + 1)
                    if (index != entries.lastIndex) out.append(',')
                }
                if (pretty) out.append('\n').append("  ".repeat(depth))
                out.append('}')
            }
            is List<*> -> {
                if (value.isEmpty()) {
                    out.append("[]")
                    return
                }
                out.append('[')
                value.forEachIndexed { index, item ->
                    if (pretty) out.append('\n').append("  ".repeat(depth + 1))
                    writeValue(item, out, pretty, depth + 1)
                    if (index != value.lastIndex) out.append(',')
                }
                if (pretty) out.append('\n').append("  ".repeat(depth))
                out.append(']')
            }
            else -> out.append(quote(value.toString()))
        }
    }

    private fun number(value: Number): String {
        val d = value.toDouble()
        return if (d == Math.floor(d) && !d.isInfinite() && Math.abs(d) < 1e15) {
            d.toLong().toString()
        } else {
            d.toString()
        }
    }

    private fun quote(text: String): String {
        val out = StringBuilder("\"")
        for (character in text) {
            when (character) {
                '"' -> out.append("\\\"")
                '\\' -> out.append("\\\\")
                '\n' -> out.append("\\n")
                '\r' -> out.append("\\r")
                '\t' -> out.append("\\t")
                '\b' -> out.append("\\b")
                '\u000C' -> out.append("\\f")
                else -> if (character < ' ') {
                    out.append("\\u").append(String.format("%04x", character.code))
                } else {
                    out.append(character)
                }
            }
        }
        return out.append('"').toString()
    }

    private class Parser(private val text: String) {
        var pos = 0
            private set

        fun atEnd() = pos >= text.length

        fun skipWhitespace() {
            while (pos < text.length && text[pos].isWhitespace()) pos++
        }

        fun readValue(): Any? {
            skipWhitespace()
            if (atEnd()) throw IllegalArgumentException("Unexpected end of input")
            return when (val c = text[pos]) {
                '{' -> readObject()
                '[' -> readArray()
                '"' -> readString()
                't' -> literal("true", true)
                'f' -> literal("false", false)
                'n' -> literal("null", null)
                else -> if (c == '-' || c.isDigit()) readNumber() else throw IllegalArgumentException("Unexpected character “$c”")
            }
        }

        private fun literal(word: String, value: Any?): Any? {
            if (!text.startsWith(word, pos)) throw IllegalArgumentException("Invalid literal, expected $word")
            pos += word.length
            return value
        }

        private fun readObject(): Map<String, Any?> {
            pos++ // {
            val map = LinkedHashMap<String, Any?>()
            skipWhitespace()
            if (pos < text.length && text[pos] == '}') {
                pos++
                return map
            }
            while (true) {
                skipWhitespace()
                if (atEnd() || text[pos] != '"') throw IllegalArgumentException("Object keys must be quoted")
                val key = readString()
                skipWhitespace()
                if (atEnd() || text[pos] != ':') throw IllegalArgumentException("Expected “:” after a key")
                pos++
                map[key] = readValue()
                skipWhitespace()
                if (atEnd()) throw IllegalArgumentException("Unclosed object")
                when (text[pos]) {
                    ',' -> pos++
                    '}' -> {
                        pos++
                        return map
                    }
                    else -> throw IllegalArgumentException("Expected “,” or “}”")
                }
            }
        }

        private fun readArray(): List<Any?> {
            pos++ // [
            val list = ArrayList<Any?>()
            skipWhitespace()
            if (pos < text.length && text[pos] == ']') {
                pos++
                return list
            }
            while (true) {
                list.add(readValue())
                skipWhitespace()
                if (atEnd()) throw IllegalArgumentException("Unclosed array")
                when (text[pos]) {
                    ',' -> pos++
                    ']' -> {
                        pos++
                        return list
                    }
                    else -> throw IllegalArgumentException("Expected “,” or “]”")
                }
            }
        }

        private fun readString(): String {
            pos++ // opening quote
            val out = StringBuilder()
            while (true) {
                if (atEnd()) throw IllegalArgumentException("Unclosed string")
                when (val c = text[pos]) {
                    '"' -> {
                        pos++
                        return out.toString()
                    }
                    '\\' -> {
                        pos++
                        if (atEnd()) throw IllegalArgumentException("Unclosed escape")
                        when (val e = text[pos]) {
                            '"' -> out.append('"')
                            '\\' -> out.append('\\')
                            '/' -> out.append('/')
                            'b' -> out.append('\b')
                            'f' -> out.append('\u000C')
                            'n' -> out.append('\n')
                            'r' -> out.append('\r')
                            't' -> out.append('\t')
                            'u' -> {
                                if (pos + 4 >= text.length) throw IllegalArgumentException("Bad unicode escape")
                                val hex = text.substring(pos + 1, pos + 5)
                                val code = hex.toIntOrNull(16) ?: throw IllegalArgumentException("Bad unicode escape")
                                out.append(code.toChar())
                                pos += 4
                            }
                            else -> throw IllegalArgumentException("Bad escape \\$e")
                        }
                        pos++
                    }
                    else -> {
                        out.append(c)
                        pos++
                    }
                }
            }
        }

        private fun readNumber(): Double {
            val start = pos
            if (pos < text.length && text[pos] == '-') pos++
            while (pos < text.length && (text[pos].isDigit() || text[pos] in ".eE+-")) pos++
            val slice = text.substring(start, pos)
            return slice.toDoubleOrNull() ?: throw IllegalArgumentException("Invalid number $slice")
        }
    }
}
