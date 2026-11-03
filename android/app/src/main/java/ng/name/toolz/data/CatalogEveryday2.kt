package ng.name.toolz.data

import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit
import java.util.Locale
import kotlin.math.log10
import kotlin.math.roundToInt

/**
 * Health and movement estimates that only need arithmetic — body composition,
 * energy, hydration, dates and pace. Each one says plainly that it is an
 * estimate, not a diagnosis.
 */

private val DATE_FORMAT = DateTimeFormatter.ofPattern("d MMM yyyy", Locale.UK)

/** Accepts 32:30, 1:02:30 or a plain number of minutes. */
internal fun parseDurationSeconds(text: String): Long? {
    val trimmed = text.trim()
    if (trimmed.isEmpty()) return null
    val parts = trimmed.split(':')
    if (parts.size > 3) return null
    var seconds = 0.0
    parts.forEach { part ->
        val value = part.trim().toDoubleOrNull() ?: return null
        seconds = seconds * 60 + value
    }
    return seconds.toLong()
}

internal fun formatDuration(seconds: Long): String {
    val hours = seconds / 3600
    val minutes = (seconds % 3600) / 60
    val secs = seconds % 60
    return if (hours > 0) "$hours:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}"
    else "$minutes:${secs.toString().padStart(2, '0')}"
}

private fun parseDate(text: String): LocalDate? = runCatching { LocalDate.parse(text.trim()) }.getOrNull()

internal val everydayTools2 = listOf(
    Tool(
        slug = "body-fat", title = "Body Fat Estimate", category = "everyday",
        tagline = "The US Navy tape estimate, with the workings.",
        keywords = listOf("body fat", "navy method", "fitness"),
        fields = listOf(
            field("sex", "Sex", FieldKind.SELECT, default = "Male", options = listOf("Male", "Female")),
            field("height", "Height (cm)", FieldKind.DECIMAL, default = "178"),
            field("neck", "Neck (cm)", FieldKind.DECIMAL, default = "38"),
            field("waist", "Waist (cm)", FieldKind.DECIMAL, default = "86"),
            field("hip", "Hip (cm, women)", FieldKind.DECIMAL, default = "95"),
        ),
        compute = { input ->
            val height = input.num("height") ?: return@Tool err("Enter your height.")
            val neck = input.num("neck") ?: return@Tool err("Enter your neck measurement.")
            val waist = input.num("waist") ?: return@Tool err("Enter your waist measurement.")
            val hip = input.num("hip") ?: 0.0
            val male = input["sex"] != "Female"
            if (height <= 0 || neck <= 0 || waist <= 0) return@Tool err("Measurements must be greater than zero.")
            val heightIn = height / 2.54
            val neckIn = neck / 2.54
            val waistIn = waist / 2.54
            val hipIn = hip / 2.54
            val bodyFat = if (male) {
                if (waistIn <= neckIn) return@Tool err("Waist must be larger than neck for this formula.")
                86.010 * log10(waistIn - neckIn) - 70.041 * log10(heightIn) + 36.76
            } else {
                if (hip <= 0) return@Tool err("Enter the hip measurement for the female formula.")
                163.205 * log10(waistIn + hipIn - neckIn) - 97.684 * log10(heightIn) - 78.387
            }
            if (!bodyFat.isFinite() || bodyFat <= 0) return@Tool err("Those measurements give no usable result; check the tape.")
            val category = when {
                male && bodyFat < 6 -> "very low"
                male && bodyFat < 14 -> "athletic"
                male && bodyFat < 18 -> "fit"
                male && bodyFat < 25 -> "average"
                male -> "above average"
                bodyFat < 14 -> "very low"
                bodyFat < 21 -> "athletic"
                bodyFat < 25 -> "fit"
                bodyFat < 32 -> "average"
                else -> "above average"
            }
            ToolResult(
                pct(bodyFat, 1),
                category,
                listOf(
                    "Measurements" to (if (male) "neck, waist, height" else "neck, waist, hip, height"),
                    "Fat-free mass at 80 kg" to fmt(80 * (1 - bodyFat / 100), 1) + " kg",
                    "Fat mass at 80 kg" to fmt(80 * bodyFat / 100, 1) + " kg",
                    "Method" to "US Navy circumference",
                ),
                note = "A tape estimate, not a scan: measure first thing in the morning, relaxed, and use it to track direction rather than an exact number.",
            )
        },
    ),
    Tool(
        slug = "calorie-estimate", title = "Calorie Estimate", category = "everyday",
        tagline = "Resting burn and daily needs from Mifflin-St Jeor.",
        keywords = listOf("calories", "bmr", "tdee"),
        fields = listOf(
            field("sex", "Sex", FieldKind.SELECT, default = "Male", options = listOf("Male", "Female")),
            field("weight", "Weight (kg)", FieldKind.DECIMAL, default = "78"),
            field("height", "Height (cm)", FieldKind.DECIMAL, default = "178"),
            field("age", "Age", FieldKind.NUMBER, default = "32"),
            field("activity", "Activity", FieldKind.SELECT, default = "Moderate", options = listOf("Sedentary", "Light", "Moderate", "Active", "Very active")),
        ),
        compute = { input ->
            val weight = input.num("weight") ?: return@Tool err("Enter your weight in kilograms.")
            val height = input.num("height") ?: return@Tool err("Enter your height in centimetres.")
            val age = (input.num("age") ?: 0.0).toInt()
            if (weight <= 0 || height <= 0 || age <= 0) return@Tool err("Weight, height and age must be greater than zero.")
            val male = input["sex"] != "Female"
            val bmr = 10 * weight + 6.25 * height - 5 * age + if (male) 5 else -161
            val multiplier = when (input["activity"]) {
                "Sedentary" -> 1.2
                "Light" -> 1.375
                "Active" -> 1.725
                "Very active" -> 1.9
                else -> 1.55
            }
            val tdee = bmr * multiplier
            ToolResult(
                "${fmt(tdee, 0)} kcal a day",
                "Resting ${fmt(bmr, 0)} kcal · maintenance ${fmt(tdee, 0)} kcal",
                listOf(
                    "Cut 0.5 kg/week" to "${fmt(tdee - 550, 0)} kcal",
                    "Gain 0.25 kg/week" to "${fmt(tdee + 275, 0)} kcal",
                    "Protein target" to "${fmt(weight * 1.6, 0)} g",
                    "Activity factor" to fmt(multiplier, 3),
                ),
                note = "An estimate for healthy adults. Pregnancy, illness, medication and eating disorders all change the picture — talk to a clinician.",
            )
        },
    ),
    Tool(
        slug = "ovulation-date", title = "Ovulation Date", category = "everyday",
        tagline = "A fertile window from the last period and cycle length.",
        keywords = listOf("ovulation", "fertility", "cycle"),
        fields = listOf(
            field("last", "First day of last period (YYYY-MM-DD)", FieldKind.TEXT, default = "2026-10-01"),
            field("cycle", "Cycle length (days)", FieldKind.NUMBER, default = "28"),
        ),
        compute = { input ->
            val last = parseDate(input.text("last")) ?: return@Tool err("Use a date like 2026-10-01.")
            val cycle = (input.num("cycle") ?: 0.0).toInt()
            if (cycle !in 20..45) return@Tool err("Cycle length should be between 20 and 45 days.")
            val ovulation = last.plusDays((cycle - 14).toLong())
            val fertileStart = ovulation.minusDays(5)
            val fertileEnd = ovulation.plusDays(1)
            val nextPeriod = last.plusDays(cycle.toLong())
            ToolResult(
                "Ovulation",
                ovulation.format(DATE_FORMAT),
                listOf(
                    "Fertile window" to "${fertileStart.format(DATE_FORMAT)} – ${fertileEnd.format(DATE_FORMAT)}",
                    "Next period" to nextPeriod.format(DATE_FORMAT),
                    "Cycle length" to "$cycle days",
                    "Days from today" to ChronoUnit.DAYS.between(LocalDate.now(), ovulation).toString(),
                ),
                note = "A calendar estimate that assumes a textbook cycle. Irregular cycles, illness and stress move ovulation, and this is not contraception.",
            )
        },
    ),
    Tool(
        slug = "pace", title = "Pace Calculator", category = "everyday",
        tagline = "Minutes per kilometre from a distance and a time.",
        keywords = listOf("pace", "running", "marathon"),
        fields = listOf(
            field("distance", "Distance (km)", FieldKind.DECIMAL, default = "10"),
            field("time", "Time (hh:mm:ss or mm:ss)", FieldKind.TEXT, default = "52:30"),
        ),
        compute = { input ->
            val distance = input.num("distance") ?: return@Tool err("Enter the distance in kilometres.")
            val seconds = parseDurationSeconds(input.text("time")) ?: return@Tool err("Use a time like 52:30 or 1:05:00.")
            if (distance <= 0 || seconds <= 0) return@Tool err("Distance and time must be greater than zero.")
            val pace = seconds / distance
            ToolResult(
                "${formatDuration(pace.toLong())} per km",
                "Speed ${fmt(distance / (seconds / 3600.0), 2)} km/h",
                listOf(
                    "Per mile" to formatDuration((pace * 1.609344).toLong()),
                    "Even 5 km" to formatDuration((pace * 5).toLong()),
                    "Even half" to formatDuration((pace * 21.0975).toLong()),
                    "Even marathon" to formatDuration((pace * 42.195).toLong()),
                ),
                note = "Even splits assume perfect pacing; most runners fade in the last third, so add a little to the early kilometres.",
            )
        },
    ),
    Tool(
        slug = "running-speed", title = "Running Speed", category = "everyday",
        tagline = "Speed in km/h and m/s, plus the pace it implies.",
        keywords = listOf("speed", "running", "velocity"),
        fields = listOf(
            field("distance", "Distance (km)", FieldKind.DECIMAL, default = "5"),
            field("time", "Time (mm:ss)", FieldKind.TEXT, default = "25:00"),
        ),
        compute = { input ->
            val distance = input.num("distance") ?: return@Tool err("Enter the distance.")
            val seconds = parseDurationSeconds(input.text("time")) ?: return@Tool err("Enter the time as mm:ss.")
            if (distance <= 0 || seconds <= 0) return@Tool err("Distance and time must be greater than zero.")
            val kmh = distance / (seconds / 3600.0)
            ToolResult(
                "${fmt(kmh, 2)} km/h",
                "${fmt(kmh / 3.6, 3)} m/s",
                listOf(
                    "Pace" to "${formatDuration((seconds / distance).toLong())} per km",
                    "Per mile" to "${formatDuration((seconds / distance * 1.609344).toLong())}",
                    "Metres covered" to fmt(distance * 1000, 0),
                ),
                note = "Average speed across the whole run; a watch will show a different graph because it samples second by second.",
            )
        },
    ),
    Tool(
        slug = "pregnancy-due-date", title = "Pregnancy Due Date", category = "everyday",
        tagline = "Naegele's rule, the trimesters and where you are now.",
        keywords = listOf("pregnancy", "due date", "edd"),
        fields = listOf(field("last", "First day of last period (YYYY-MM-DD)", FieldKind.TEXT, default = "2026-09-01")),
        compute = { input ->
            val last = parseDate(input.text("last")) ?: return@Tool err("Use a date like 2026-09-01.")
            val today = LocalDate.now()
            if (last.isAfter(today)) return@Tool err("The last period cannot be in the future.")
            val due = last.plusDays(280)
            val weeks = ChronoUnit.DAYS.between(last, today) / 7
            if (weeks > 45) return@Tool err("That date is more than 45 weeks ago; check the year.")
            val conception = last.plusDays(14)
            ToolResult(
                "Due date",
                due.format(DATE_FORMAT),
                listOf(
                    "Weeks today" to "$weeks weeks",
                    "Conception estimate" to conception.format(DATE_FORMAT),
                    "Second trimester" to "${last.plusDays(98).format(DATE_FORMAT)} – ${last.plusDays(189).format(DATE_FORMAT)}",
                    "Third trimester" to "from ${last.plusDays(190).format(DATE_FORMAT)}",
                    "Days to go" to ChronoUnit.DAYS.between(today, due).toString(),
                ),
                note = "Naegele's rule assumes a 28-day cycle. Only a dating scan can give an accurate due date — and only about 4% of babies arrive on it.",
            )
        },
    ),
    Tool(
        slug = "water-intake", title = "Water Intake", category = "everyday",
        tagline = "A daily hydration target from weight and exercise.",
        keywords = listOf("water", "hydration", "health"),
        fields = listOf(
            field("weight", "Weight (kg)", FieldKind.DECIMAL, default = "78"),
            field("exercise", "Exercise (minutes)", FieldKind.NUMBER, default = "45"),
            field("climate", "Climate", FieldKind.SELECT, default = "Warm", options = listOf("Temperate", "Warm", "Hot")),
        ),
        compute = { input ->
            val weight = input.num("weight") ?: return@Tool err("Enter your weight.")
            val exercise = input.num("exercise") ?: 0.0
            if (weight <= 0 || exercise < 0) return@Tool err("Weight must be positive and exercise cannot be negative.")
            val base = weight * 0.033
            val training = exercise / 30.0 * 0.35
            val climateExtra = when (input["climate"]) {
                "Hot" -> 0.7
                "Warm" -> 0.35
                else -> 0.0
            }
            val total = base + training + climateExtra
            val glasses = (total * 1000 / 250).roundToInt()
            ToolResult(
                "${fmt(total, 2)} L a day",
                "About $glasses glasses of 250 ml",
                listOf(
                    "Base" to "${fmt(base, 2)} L",
                    "Exercise" to "${fmt(training, 2)} L",
                    "Climate" to "${fmt(climateExtra, 2)} L",
                    "Per waking hour" to "${fmt(total / 16, 2)} L",
                ),
                note = "A rough target for healthy adults. Kidney, heart and liver conditions change fluid limits — follow your doctor, not an app.",
            )
        },
    ),
)
