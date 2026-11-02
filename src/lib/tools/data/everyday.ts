import type { ToolDefinition } from "../types";

export const everydayTools: ToolDefinition[] = [
  {
    slug: "unit-converter",
    name: "Unit Converter",
    category: "everyday",
    tagline: "Convert length, mass, volume, area, speed, time and data units.",
    intent: "convert units of measurement",
    keywords: [
      "unit converter",
      "length converter",
      "weight converter",
      "metric to imperial",
      "convert units online",
    ],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 91,
    addedAt: "2025-02-08",
    seoTitle: "Unit Converter — Length, Weight, Volume, Area, Speed & Data",
    seoDescription:
      "Convert between metric and imperial units for length, mass, volume, area, speed, time and digital storage. Exact factors and full working shown.",
    content: {
      intro: [
        "Most converters give you one number and no way to check it. This one shows the exact conversion factor it used, the full expression, and a quick table of nearby values so you can sanity-check the result.",
        "Seven measurement families are covered — length, mass, volume, area, speed, time and digital storage — with exact international definitions where they exist and clearly labelled approximations where they do not.",
      ],
      howTo: [
        "Choose a measurement family.",
        "Pick the unit you are converting from and to.",
        "Enter the value; the conversion appears as you type.",
        "Switch direction with the swap button, or copy the result.",
      ],
      method: {
        title: "Conversion factors",
        paragraphs: [
          "Every conversion goes through a base unit: metres for length, kilograms for mass, litres for volume, square metres for area, metres per second for speed, seconds for time and bytes for data. The value is multiplied into the base unit and then divided out, which keeps factors exact.",
          "Some definitions are exact by treaty: 1 inch is exactly 25.4 mm, 1 pound is exactly 0.45359237 kg, and 1 US gallon is exactly 3.785411784 litres. Others, such as fluid ounces, differ between US and imperial systems — the tool labels which one it uses.",
        ],
        formula: "result = value × factor(from) ÷ factor(to)",
      },
      examples: [
        {
          title: "Converting 5 feet 9 inches to centimetres",
          steps: ["Choose Length.", "Convert 5.75 feet to centimetres.", "1 foot = 0.3048 m exactly."],
          result: "175.26 cm",
        },
        {
          title: "Converting 80 kilograms to pounds",
          steps: ["Choose Mass.", "1 kg = 2.2046226218 lb."],
          result: "176.37 lb",
        },
        {
          title: "Converting 500 gigabytes to gigabytes vs gibibytes",
          steps: ["Choose Data storage.", "Note that GB is decimal (10⁹ bytes) and GiB is binary (2³⁰ bytes)."],
          result: "500 GB = 465.66 GiB",
        },
      ],
      limitations: [
        "US and imperial liquid measures differ (a US gallon is smaller than an imperial gallon). The tool states which system is in use.",
        "Rounding is applied for display; use the exact factor shown when precision matters.",
        "Currency and other rate-based conversions are deliberately excluded because rates change daily.",
      ],
      faqs: [
        {
          q: "Why is 500 GB not 500 GiB?",
          a: "Drive manufacturers use decimal gigabytes (1,000,000,000 bytes) while operating systems often report binary gibibytes (1,073,741,824 bytes). That is why a new 500 GB drive shows about 465 GiB.",
        },
        {
          q: "Are US and imperial gallons the same?",
          a: "No. A US gallon is 3.785 litres; an imperial gallon is 4.546 litres. The tool labels which one it is using.",
        },
        {
          q: "Is the inch definition exact?",
          a: "Yes. Since the 1959 international yard and pound agreement, 1 inch is exactly 25.4 millimetres.",
        },
      ],
    },
  },
  {
    slug: "temperature-converter",
    name: "Temperature Converter",
    category: "everyday",
    tagline: "Convert Celsius, Fahrenheit, Kelvin and Rankine with the formula shown.",
    intent: "convert celsius to fahrenheit",
    keywords: [
      "temperature converter",
      "celsius to fahrenheit",
      "fahrenheit to celsius",
      "kelvin converter",
      "c to f calculator",
    ],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 93,
    addedAt: "2025-02-09",
    seoTitle: "Temperature Converter — Celsius, Fahrenheit & Kelvin",
    seoDescription:
      "Convert between Celsius, Fahrenheit, Kelvin and Rankine instantly. Shows the exact formula, reference points and validity limits for each scale.",
    content: {
      intro: [
        "Temperature is the conversion people get wrong most often, because the scales do not share a zero point. Doubling 10 °C does not double the heat in Fahrenheit terms: 10 °C is 50 °F, and 20 °C is 68 °F, not 100 °F.",
        "Enter a value in any of the four common absolute scales and see the equivalent in the others, with the formula that produced it and a table of reference temperatures for context.",
      ],
      howTo: [
        "Enter the temperature and choose its scale.",
        "Read the equivalents in Celsius, Fahrenheit, Kelvin and Rankine.",
        "Use the reference table to sanity-check the result.",
        "Copy the value you need with its unit attached.",
      ],
      method: {
        title: "The conversion formulas",
        paragraphs: [
          "Celsius and Fahrenheit are offset scales: °F = °C × 9/5 + 32 and °C = (°F − 32) × 5/9. Kelvin starts at absolute zero and uses the Celsius degree size, so K = °C + 273.15. Rankine uses the Fahrenheit degree size, so °R = °F + 459.67.",
          "Kelvin and Rankine cannot be negative — below absolute zero is not physically meaningful. The converter warns instead of silently returning an impossible value.",
        ],
        formula: "°F = °C × 1.8 + 32    ·    K = °C + 273.15    ·    °R = °F + 459.67",
      },
      examples: [
        {
          title: "Body temperature",
          steps: ["Enter 37 °C.", "Apply 37 × 1.8 + 32."],
          result: "98.6 °F · 310.15 K",
        },
        {
          title: "A winter forecast of 5 °F",
          steps: ["Enter 5 °F.", "(5 − 32) × 5/9."],
          result: "−15 °C",
        },
        {
          title: "Room temperature in Kelvin",
          steps: ["Enter 20 °C.", "Add 273.15."],
          result: "293.15 K",
        },
      ],
      limitations: [
        "This converts temperature scales only. Perceived temperature (wind chill, humidity) uses different formulas and is not modelled.",
        "Baking conversions between fan, conventional and gas-mark ovens are not temperature-scale conversions and need their own table.",
        "Values below absolute zero (−273.15 °C) are flagged as physically impossible rather than converted.",
      ],
      faqs: [
        {
          q: "What is the formula to convert Celsius to Fahrenheit?",
          a: "Multiply by 9, divide by 5, then add 32: °F = °C × 1.8 + 32. For example, 30 °C becomes 86 °F.",
        },
        {
          q: "Which is colder, 0 °C or 32 °F?",
          a: "They are identical — 32 °F is the freezing point of water at the same temperature as 0 °C.",
        },
        {
          q: "Can Kelvin be negative?",
          a: "No. Absolute zero is 0 K, and nothing can be colder. A negative Kelvin value indicates an invalid conversion.",
        },
      ],
    },
  },
  {
    slug: "time-zone-converter",
    name: "Time Zone Converter",
    category: "everyday",
    tagline: "Compare a moment across cities and find the best time to meet.",
    intent: "convert time between time zones",
    keywords: [
      "time zone converter",
      "world clock",
      "meeting planner",
      "utc to local time",
      "what time is it in",
    ],
    status: "live",
    actions: ["copy"],
    effort: "quick",
    popularity: 81,
    addedAt: "2025-02-10",
    seoTitle: "Time Zone Converter — Compare Cities and Plan Meetings",
    seoDescription:
      "Convert a time between world cities with daylight-saving handled automatically. See working hours, offsets and the best overlap for a meeting.",
    content: {
      intro: [
        "Time zone conversion is easy until daylight saving changes on different dates in different countries. This converter uses the IANA tz database through your browser's Intl API, so offsets are correct for the specific date you choose — not a fixed winter offset.",
        "Choose a source time, then compare it across a list of cities. The tool marks which zones are inside typical working hours, so you can find an overlap instead of emailing everyone three times.",
      ],
      howTo: [
        "Pick a date and time and the city you are converting from.",
        "Add the cities you need to compare — up to twelve.",
        "Read each local time and its offset from UTC.",
        "Look for the working-hours markers to find a reasonable meeting time.",
      ],
      method: {
        title: "Offsets and daylight saving",
        paragraphs: [
          "Each city is mapped to an IANA zone identifier such as Europe/London or America/New_York. The browser's Intl.DateTimeFormat resolves that zone for the chosen instant, which handles DST transitions, historical rule changes and unusual offsets like India's +5:30 or Nepal's +5:45.",
          "The tool never assumes a fixed offset. If you convert a July date, London is BST (+01:00); convert a January date and it is GMT (+00:00), automatically.",
        ],
        formula: "new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Tokyo', timeStyle: 'short' }).format(instant)",
      },
      examples: [
        {
          title: "Planning a call from Lagos to New York",
          steps: ["Set 15:00 in Lagos (WAT, UTC+1).", "Add New York (EDT, UTC−4 in summer)."],
          result: "09:00 in New York — a workable start to the day",
        },
        {
          title: "Scheduling around a Sydney–London overlap",
          steps: ["Set 09:00 in London.", "Add Sydney (AEST, UTC+10)."],
          result: "19:00 in Sydney — outside typical office hours",
        },
      ],
      limitations: [
        "Zone data comes from your browser; an outdated browser may have stale daylight-saving rules for recently changed countries.",
        "Historical dates before the 1970s may use simplified rules in some tz database entries.",
        "The working-hours marker is a convention (09:00–17:00 local), not anyone's actual availability.",
      ],
      faqs: [
        {
          q: "Does this handle daylight saving automatically?",
          a: "Yes. Conversions are resolved for the specific date you enter, so DST transitions are applied only when they are in effect on that date.",
        },
        {
          q: "Why is India's offset not a whole hour?",
          a: "India uses UTC+05:30. Nepal uses UTC+05:45. The tz database supports these fractional offsets and so does this converter.",
        },
        {
          q: "Can I share a specific meeting time?",
          a: "Yes. The result panel gives you a copyable summary listing each city and its local time for the same instant.",
        },
      ],
    },
  },
  {
    slug: "bmi-calculator",
    name: "BMI Calculator",
    category: "everyday",
    tagline: "Body mass index with WHO categories and honest limitations.",
    intent: "calculate bmi",
    keywords: [
      "bmi calculator",
      "body mass index",
      "bmi chart",
      "healthy weight calculator",
      "bmi metric imperial",
    ],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 86,
    addedAt: "2025-02-12",
    seoTitle: "BMI Calculator — Body Mass Index With WHO Categories",
    seoDescription:
      "Calculate body mass index from metric or imperial measurements, see the WHO category and a healthy weight range — with clear limits of what BMI means.",
    content: {
      intro: [
        "Body mass index is a single number that compares your weight to your height. It is a useful population screening tool because it is quick and needs no equipment, but it cannot distinguish muscle from fat, bone density, or where fat is carried.",
        "Use this calculator as a rough reference point, not a diagnosis. Athletes frequently read as overweight, and people with low muscle mass can read as 'normal' while carrying excess fat.",
      ],
      howTo: [
        "Choose metric or imperial units.",
        "Enter your height and weight.",
        "Read your BMI and its WHO category.",
        "Check the healthy weight range for your height, and read the limitations below.",
      ],
      method: {
        title: "The formula and the categories",
        paragraphs: [
          "Metric BMI is weight in kilograms divided by height in metres squared. Imperial BMI multiplies weight in pounds by 703 and divides by height in inches squared. The two produce the same number.",
          "The World Health Organization cut-offs are: below 18.5 underweight, 18.5–24.9 normal range, 25.0–29.9 overweight, and 30.0 or above obese (with further classes above 35 and 40). These thresholds were derived from population data and do not fit every body type or ethnicity equally well.",
        ],
        formula: "BMI = kg ÷ m²    ·    BMI = (lb × 703) ÷ in²",
      },
      examples: [
        {
          title: "70 kg at 1.75 m",
          steps: ["Height 1.75 m, weight 70 kg.", "1.75² = 3.0625.", "70 ÷ 3.0625."],
          result: "BMI 22.9 — normal range",
        },
        {
          title: "160 lb at 5 ft 10 in",
          steps: ["Height 70 inches, weight 160 lb.", "(160 × 703) ÷ 70²."],
          result: "BMI 22.9 — the same person in imperial units",
        },
      ],
      limitations: [
        "BMI does not measure body fat, muscle mass or fat distribution, and it can misclassify muscular people as overweight.",
        "The standard cut-offs are derived largely from adult populations; children and teenagers require age- and sex-specific percentile charts.",
        "Pregnancy, significant fluid retention and some medical conditions make BMI unreliable.",
        "This is not medical advice. Speak to a qualified clinician about your health.",
      ],
      faqs: [
        {
          q: "Is BMI accurate?",
          a: "It is accurate as a population screening measure and approximate for individuals. It cannot separate muscle from fat, which is why body composition and waist circumference give a better individual picture.",
        },
        {
          q: "What is a healthy BMI for adults?",
          a: "The WHO defines 18.5–24.9 as the normal range, though some health bodies use different thresholds for people of South Asian descent, where risk increases at a lower BMI.",
        },
        {
          q: "Should I use BMI for children?",
          a: "No. Children and teenagers need age- and sex-specific BMI percentile charts because body composition changes with growth.",
        },
      ],
    },
  },
];
