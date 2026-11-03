package ng.name.toolz.data

import java.util.Locale

/**
 * A small, strict arithmetic parser for the calculator tools.
 *
 * Recursive descent, no eval, no library: `+ - * / % ^`, brackets, unary minus,
 * the usual constants and functions. Trigonometry works in degrees unless the
 * caller asks for radians, which is what a physical calculator does.
 */

internal class ExpressionParser(
    private val source: String,
    private val degrees: Boolean = true,
) {
    private var index = 0

    fun parse(): Double {
        val value = expression()
        skipSpaces()
        if (index < source.length) throw ExpressionError("Unexpected “${source[index]}” at ${index + 1}")
        if (!value.isFinite()) throw ExpressionError("That answer is not a finite number.")
        return value
    }

    private fun peek(): Char? = if (index < source.length) source[index] else null

    private fun skipSpaces() {
        while (index < source.length && source[index].isWhitespace()) index++
    }

    private fun expression(): Double {
        var value = term()
        while (true) {
            skipSpaces()
            when (peek()) {
                '+' -> { index++; value += term() }
                '-' -> { index++; value -= term() }
                else -> return value
            }
        }
    }

    private fun term(): Double {
        var value = unary()
        while (true) {
            skipSpaces()
            when (peek()) {
                '*' -> { index++; value *= unary() }
                '/' -> {
                    index++
                    val divisor = unary()
                    if (divisor == 0.0) throw ExpressionError("Division by zero.")
                    value /= divisor
                }
                '%' -> {
                    index++
                    val divisor = unary()
                    if (divisor == 0.0) throw ExpressionError("Division by zero.")
                    value %= divisor
                }
                else -> return value
            }
        }
    }

    private fun unary(): Double {
        skipSpaces()
        return when (peek()) {
            '-' -> { index++; -unary() }
            '+' -> { index++; unary() }
            else -> power()
        }
    }

    private fun power(): Double {
        val base = primary()
        skipSpaces()
        if (peek() == '^') {
            index++
            return Math.pow(base, unary())
        }
        return base
    }

    private fun primary(): Double {
        skipSpaces()
        val character = peek() ?: throw ExpressionError("The expression ends too early.")
        if (character == '(') {
            index++
            val value = expression()
            skipSpaces()
            if (peek() == ')') index++ else throw ExpressionError("Missing a closing bracket.")
            return value
        }
        if (character.isLetter()) {
            val start = index
            while (index < source.length && (source[index].isLetterOrDigit() || source[index] == '_')) index++
            val name = source.substring(start, index).lowercase(Locale.UK)
            skipSpaces()
            if (peek() == '(') {
                index++
                val argument = expression()
                skipSpaces()
                if (peek() == ')') index++ else throw ExpressionError("Missing a closing bracket after $name.")
                return function(name, argument)
            }
            return constant(name)
        }
        val start = index
        while (index < source.length && (source[index].isDigit() || source[index] == '.')) index++
        if (start == index) throw ExpressionError("Unexpected “$character” at ${index + 1}")
        val text = source.substring(start, index)
        return text.toDoubleOrNull() ?: throw ExpressionError("“$text” is not a number.")
    }

    private fun constant(name: String): Double = when (name) {
        "pi", "π" -> Math.PI
        "e" -> Math.E
        "tau" -> Math.PI * 2
        else -> throw ExpressionError("Unknown name “$name”.")
    }

    private fun toRadians(value: Double) = if (degrees) Math.toRadians(value) else value
    private fun fromRadians(value: Double) = if (degrees) Math.toDegrees(value) else value

    private fun function(name: String, value: Double): Double = when (name) {
        "sin" -> Math.sin(toRadians(value))
        "cos" -> Math.cos(toRadians(value))
        "tan" -> Math.tan(toRadians(value))
        "asin" -> fromRadians(Math.asin(value))
        "acos" -> fromRadians(Math.acos(value))
        "atan" -> fromRadians(Math.atan(value))
        "sqrt" -> if (value < 0) throw ExpressionError("Cannot take the square root of a negative number.") else Math.sqrt(value)
        "cbrt" -> Math.cbrt(value)
        "ln" -> if (value <= 0) throw ExpressionError("ln needs a positive number.") else Math.log(value)
        "log" -> if (value <= 0) throw ExpressionError("log needs a positive number.") else Math.log10(value)
        "abs" -> Math.abs(value)
        "exp" -> Math.exp(value)
        "round" -> Math.round(value).toDouble()
        "floor" -> Math.floor(value)
        "ceil" -> Math.ceil(value)
        "fact" -> factorial(value)
        else -> throw ExpressionError("Unknown function “$name”.")
    }

    private fun factorial(value: Double): Double {
        if (value < 0 || value != Math.floor(value) || value > 170) {
            throw ExpressionError("fact() needs a whole number from 0 to 170.")
        }
        var result = 1.0
        for (step in 2..value.toInt()) result *= step
        return result
    }
}

internal class ExpressionError(message: String) : IllegalArgumentException(message)

/** Evaluates an arithmetic expression, or throws [ExpressionError]. */
internal fun evaluateExpression(source: String, degrees: Boolean = true): Double =
    ExpressionParser(source, degrees).parse()
