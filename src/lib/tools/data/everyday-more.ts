import type { ToolDefinition } from "../types";

/**
 * Section J. Everyday and lifestyle tools. The health estimates are labelled as
 * estimates everywhere — population equations, not diagnosis — and the timers
 * are local-only because there is no server to schedule anything.
 */
export const everydayMoreTools: ToolDefinition[] = [
  {
    slug: "calorie-estimator",
    name: "Calorie Estimator",
    category: "everyday",
    tagline: "Maintenance calories and a protein-forward macro split.",
    intent: "how many calories should i eat",
    keywords: ["calorie calculator", "tdee calculator", "maintenance calories", "bmr calculator", "macro calculator", "daily calorie needs"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 88,
    addedAt: "2025-03-06",
    seoTitle: "Calorie Estimator — BMR, TDEE and Daily Target",
    seoDescription:
      "Estimate basal metabolic rate and maintenance calories with Mifflin–St Jeor, then see a daily target and macronutrient split for losing, holding or gaining.",
    content: {
      intro: [
        "Calorie calculators answer one question well: roughly how much energy a body of your size burns. Mifflin–St Jeor is the equation most dietitians use, and its largest source of error is not the maths but the activity multiplier people choose.",
        "The tool shows the basal rate, the maintenance figure and the target separately, so it is obvious which number changed when you adjust the activity band.",
      ],
      howTo: [
        "Enter age, height and weight.",
        "Pick the activity band that describes your actual week, not your best week.",
        "Choose lose, maintain or gain.",
        "Read the target, the expected weekly change and the macro split.",
      ],
      method: {
        title: "Mifflin–St Jeor plus an activity multiplier",
        paragraphs: [
          "BMR = 10 × weight(kg) + 6.25 × height(cm) − 5 × age + (5 for men, −161 for women). That is the energy used at complete rest. Multiplying by 1.2 to 1.9 accounts for movement and exercise, which is where most of the uncertainty sits.",
          "A 500 kcal daily deficit is used for weight loss because roughly 7,700 kcal corresponds to a kilogram of fat. The tool refuses to push the target below your basal rate, since a deficit that deep usually costs muscle and adherence rather than fat.",
        ],
        formula: "BMR = 10w + 6.25h − 5a ± 161; TDEE = BMR × activity",
      },
      examples: [
        {
          title: "A sedentary office worker",
          steps: ["165 cm, 60 kg, 30 years, female.", "Activity 1.2.", "Maintain."],
          result: "BMR 1,320 kcal, maintenance about 1,584 kcal",
        },
        {
          title: "A 0.5 kg per week target",
          steps: ["Same person, goal set to lose."],
          result: "Target about 1,320 kcal — the deficit is capped at BMR, with a note explaining why",
        },
      ],
      limitations: [
        "A population equation with a standard error of roughly ±300 kcal — treat the output as a starting point you adjust from real weight change.",
        "It cannot see body composition, medication, thyroid function, pregnancy or illness.",
        "Macro splits are a preference, not a requirement. Total calories and protein intake matter far more than the ratio.",
      ],
      faqs: [
        {
          q: "What is the difference between BMR and TDEE?",
          a: "BMR is the energy you burn at rest. TDEE is BMR multiplied by activity, so it includes walking, exercise and digestion — it is the number that maintains your weight.",
        },
        {
          q: "How accurate is this?",
          a: "Within a few hundred calories for most people, which is enough to plan and not enough to be precise. Track weight over two to three weeks and adjust by 100–200 kcal rather than trusting the first figure.",
        },
        {
          q: "Should I eat back exercise calories?",
          a: "The activity multiplier already includes your usual training. Eating back logged exercise calories usually double-counts them.",
        },
      ],
    },
  },
  {
    slug: "water-intake-estimator",
    name: "Water Intake Estimator",
    category: "everyday",
    tagline: "A daily fluid target from weight, exercise and climate.",
    intent: "how much water should i drink",
    keywords: ["water intake calculator", "how much water to drink", "daily water intake", "hydration calculator", "water goal", "fluid intake"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 80,
    addedAt: "2025-03-06",
    seoTitle: "Water Intake Estimator — Daily Fluid Target",
    seoDescription:
      "Estimate daily fluid needs from body weight, exercise minutes and climate, with the glasses equivalent and the share that comes from food.",
    content: {
      intro: [
        "The eight-glasses rule is a slogan, not a guideline — needs scale with body size, sweat and climate. This estimator starts from 35 ml per kilogram and adds fluid for exercise and heat.",
        "It is deliberately presented as a rough target. Thirst, urine colour and how you feel are better day-to-day signals, and some medical conditions make fluid targets dangerous rather than helpful.",
      ],
      howTo: [
        "Enter your body weight in kilograms.",
        "Add today's moderate exercise minutes.",
        "Choose the climate band.",
        "Compare the litre target with the number of 250 ml glasses.",
      ],
      method: {
        title: "Where the numbers come from",
        paragraphs: [
          "The baseline is 35 ml per kilogram of body weight, a common clinical rule of thumb. Exercise adds about 350 ml per 30 minutes of sweating, and hot weather adds 0.5–0.9 litres depending on humidity.",
          "Food supplies roughly a fifth to a third of total water intake, so the drinking target is lower than the total fluid figure would suggest — the table on the page makes that split explicit.",
        ],
        formula: "litres = 0.035 × kg + 0.35 per 30 min exercise + climate allowance",
      },
      examples: [
        {
          title: "A temperate day",
          steps: ["70 kg, no exercise, temperate."],
          result: "About 2.45 L total, roughly 10 glasses including food",
        },
        {
          title: "A hot day with a run",
          steps: ["70 kg, 60 minutes of exercise, very hot."],
          result: "About 4.1 L — sweat replacement dominates",
        },
      ],
      limitations: [
        "Not medical advice. Kidney, heart and liver conditions often require fluid restriction, where a target like this is actively wrong.",
        "Caffeine in normal amounts counts towards fluid intake; the old idea that coffee dehydrates is overstated.",
        "Drinking well beyond thirst does not improve performance and can dilute sodium during endurance events.",
      ],
      faqs: [
        {
          q: "Is eight glasses a day right?",
          a: "It is a rough average for a small adult, not a target derived from evidence. Body size matters more, so a 55 kg and a 95 kg person have different needs.",
        },
        {
          q: "How do I know if I am hydrated?",
          a: "Pale straw-coloured urine and infrequent thirst are reasonable everyday guides. Dark urine plus thirst suggests you are behind.",
        },
        {
          q: "Does tea and coffee count?",
          a: "Yes. The mild diuretic effect of caffeine does not outweigh the fluid in the drink at normal intakes.",
        },
      ],
    },
  },
  {
    slug: "sleep-duration-calculator",
    name: "Sleep Duration Calculator",
    category: "everyday",
    tagline: "How long you actually slept, and when to go to bed.",
    intent: "calculate sleep duration",
    keywords: ["sleep calculator", "sleep duration calculator", "what time should i go to bed", "sleep cycles", "bedtime calculator", "how much sleep"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 82,
    addedAt: "2025-03-06",
    seoTitle: "Sleep Duration Calculator — Cycles and Bedtimes",
    seoDescription:
      "Work out how long you slept from bedtime and wake time, subtract time to fall asleep, and find bedtimes that land between 90-minute sleep cycles.",
    content: {
      intro: [
        "Time in bed and time asleep are different numbers, and the gap is usually 10 to 30 minutes. This calculator subtracts that latency so the figure reflects sleep rather than lying down.",
        "It also works backwards: given a wake time, it shows the bedtimes that would complete four, five or six 90-minute cycles, which tends to feel better than waking mid-cycle.",
      ],
      howTo: [
        "Enter bedtime and wake time on a 24-hour clock.",
        "Add how long you usually take to fall asleep.",
        "Set the sleep target you are aiming for.",
        "Compare the shortfall or surplus, and pick a bedtime suggestion.",
      ],
      method: {
        title: "Duration, efficiency and cycles",
        paragraphs: [
          "Duration handles the midnight wrap: if wake time is earlier than bedtime, a day is added. Sleep efficiency is time asleep divided by time in bed, and a figure below 85% usually means the time in bed is longer than the sleep need.",
          "Cycle suggestions subtract the latency from a 90-minute multiple before the wake time. Cycles vary between 70 and 120 minutes and lengthen towards morning, so this is a heuristic for choosing a bedtime rather than a measurement.",
        ],
        formula: "asleep = (wake − bedtime) − latency; cycles = asleep ÷ 90",
      },
      examples: [
        {
          title: "A typical weeknight",
          steps: ["23:30 to 07:00, 15 minutes to fall asleep."],
          result: "7h 30m in bed, 7h 15m asleep, four full cycles",
        },
        {
          title: "Working backwards",
          steps: ["Wake at 07:00, latency 10 minutes.", "Pick the six-cycle bedtime."],
          result: "21:50 — about nine hours including latency",
        },
      ],
      limitations: [
        "A clock cannot measure sleep quality: waking repeatedly or snoring with pauses can ruin sleep that looks long enough.",
        "The 90-minute cycle is an average; individual cycles vary by half an hour or more.",
        "Persistent insomnia, daytime sleepiness or suspected sleep apnoea needs clinical assessment, not arithmetic.",
      ],
      faqs: [
        {
          q: "How much sleep do adults need?",
          a: "Seven to nine hours is the usual range for adults. Consistently under six is associated with measurable cognitive and metabolic costs.",
        },
        {
          q: "Why does waking between cycles feel easier?",
          a: "Waking from deep sleep produces grogginess that can last an hour. Ending a cycle, in lighter sleep, tends to feel clearer.",
        },
        {
          q: "Does the calculator work for night shifts?",
          a: "Yes, for duration — it wraps across midnight. Cycle timing is less predictable when sleep is split or shifted.",
        },
      ],
    },
  },
  {
    slug: "pregnancy-due-date-calculator",
    name: "Pregnancy Due Date Calculator",
    category: "everyday",
    tagline: "A due date from your last period, adjusted for cycle length.",
    intent: "pregnancy due date",
    keywords: ["pregnancy due date calculator", "due date calculator", "naegele rule", "how far along am i", "gestational age calculator", "edd calculator"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 84,
    addedAt: "2025-03-06",
    seoTitle: "Pregnancy Due Date Calculator — Weeks and Milestones",
    seoDescription:
      "Estimate a due date from the last menstrual period, adjusted for cycle length, with gestational age, trimester and the standard milestone dates.",
    content: {
      intro: [
        "Naegele's rule adds 280 days to the first day of the last period and then corrects for cycle length, because ovulation later in the cycle shifts everything later. That is why a 35-day cycle produces a due date a week after the textbook one.",
        "The result also shows gestational age and the usual milestones. Only about 4% of births land exactly on the estimated date, which is why clinicians talk in windows rather than days.",
      ],
      howTo: [
        "Enter the first day of your last period.",
        "Set your average cycle length if it is not 28 days.",
        "Read the due date and the current gestational age.",
        "Note the milestone dates and confirm the dating with your clinician.",
      ],
      method: {
        title: "Naegele's rule, with the cycle adjustment",
        paragraphs: [
          "The due date is the last period plus 280 days, shifted by the difference between your cycle and 28. Gestational age counts from the same starting point, which is why 40 weeks of pregnancy is about 38 weeks of actual gestation.",
          "Milestones follow from the same dating: the first trimester ends at 14 weeks, the anatomy scan window opens at 18, full term begins at 37 and the estimated date is 40.",
        ],
        formula: "EDD = LMP + 280 days + (cycle − 28)",
      },
      examples: [
        {
          title: "A textbook cycle",
          steps: ["LMP 1 January, cycle 28 days."],
          result: "Due 8 October, 40 weeks later",
        },
        {
          title: "A longer cycle",
          steps: ["LMP 1 January, cycle 35 days."],
          result: "Due about 15 October — ovulation was a week later",
        },
      ],
      limitations: [
        "An early ultrasound is more accurate than any calculation from dates, and clinicians use it to set the official due date.",
        "Irregular cycles make the last-period method unreliable.",
        "This is information, not medical advice or an assessment of the pregnancy.",
      ],
      faqs: [
        {
          q: "How is the due date calculated?",
          a: "Add 280 days to the first day of the last menstrual period, then shift by the difference between your cycle length and 28 days.",
        },
        {
          q: "How accurate is it?",
          a: "Within about two weeks for most pregnancies. Only around 4% of babies are born on the exact date, which is why full term is a five-week window (37–42 weeks).",
        },
        {
          q: "What if I know my conception date?",
          a: "Add 266 days to conception, which is about the same as adding 280 days to a period that started 14 days earlier.",
        },
      ],
    },
  },
  {
    slug: "ovulation-date-estimator",
    name: "Ovulation Date Estimator",
    category: "everyday",
    tagline: "The likely ovulation date and fertile window from your cycle.",
    intent: "when do i ovulate",
    keywords: ["ovulation calculator", "fertile window calculator", "when do i ovulate", "ovulation date", "cycle tracker", "fertile days"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 78,
    addedAt: "2025-03-06",
    seoTitle: "Ovulation Date Estimator — Fertile Window",
    seoDescription:
      "Estimate ovulation and the fertile window from your last period, cycle length and luteal phase, with projected period dates and clear limits of calendar methods.",
    content: {
      intro: [
        "Ovulation is estimated backwards from the next period because the luteal phase — the second half of the cycle — is more stable at around 14 days than the first half. A long cycle therefore means later ovulation, not a later period relative to ovulation.",
        "The fertile window runs from five days before ovulation to about one day after: sperm survive up to five days, the egg roughly 24 hours.",
      ],
      howTo: [
        "Enter the first day of your last period.",
        "Set your usual cycle length.",
        "Adjust the luteal phase only if you know it differs from 14 days.",
        "Read the ovulation date, the fertile window and the next three periods.",
      ],
      method: {
        title: "Calendar estimation and its limits",
        paragraphs: [
          "Ovulation ≈ cycle length − luteal length, counted from the first day of the period. The fertile window is that date minus five days to plus one day.",
          "Calendar methods assume a regular cycle. Stress, illness, travel and weight change all delay ovulation, and sperm can survive long enough that the window is wider than the arithmetic implies. Ovulation predictor tests and basal body temperature are more reliable.",
        ],
        formula: "ovulation = LMP + (cycle length − luteal length)",
      },
      examples: [
        {
          title: "A 28-day cycle",
          steps: ["LMP 1 January, 28-day cycle, 14-day luteal phase."],
          result: "Ovulation around 15 January, fertile 10–16 January",
        },
        {
          title: "A 32-day cycle",
          steps: ["LMP 1 January, 32-day cycle."],
          result: "Ovulation around 19 January — four days later than the textbook cycle",
        },
      ],
      limitations: [
        "Not a contraceptive method. Calendar estimates have a high failure rate for avoiding pregnancy.",
        "Not a fertility diagnosis. Irregular or absent ovulation needs clinical investigation.",
        "The luteal phase is assumed constant, which is a good approximation but not a law.",
      ],
      faqs: [
        {
          q: "How accurate is a calendar estimate?",
          a: "It is reasonable for a regular cycle and unreliable for an irregular one. Confirming with an ovulation test or temperature tracking is far more precise.",
        },
        {
          q: "How long is the fertile window?",
          a: "About six days: five before ovulation and the day of ovulation itself. Conception is most likely in the two days before ovulation.",
        },
        {
          q: "Can I ovulate more than once in a cycle?",
          a: "Two eggs can be released within about 24 hours, which is how fraternal twins happen, but a second ovulation days later in the same cycle is not typical.",
        },
      ],
    },
  },
  {
    slug: "body-fat-estimator",
    name: "Body Fat Estimator",
    category: "everyday",
    tagline: "Tape-measure body fat with the US Navy equation.",
    intent: "body fat calculator",
    keywords: ["body fat calculator", "body fat percentage", "navy body fat formula", "waist to height", "lean mass calculator", "body composition"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 76,
    addedAt: "2025-03-06",
    seoTitle: "Body Fat Estimator — Tape Measure Method",
    seoDescription:
      "Estimate body fat percentage from neck, waist and hip measurements with the US Navy equation, and see fat mass, lean mass and reference ranges.",
    content: {
      intro: [
        "A tape measure and a regression equation get within a few percentage points of a DEXA scan for most people, at no cost. The US Navy method uses circumference ratios, which is why waist and neck matter more than weight.",
        "The tool reports fat mass and lean mass too, and shows the reference bands so a number has context rather than sounding like a verdict.",
      ],
      howTo: [
        "Measure your neck just below the larynx, tape level and not pulled tight.",
        "Measure your waist at the navel for men, at the narrowest point for women.",
        "For the female equation, add the hip at its widest point.",
        "Enter your weight to see fat and lean mass.",
      ],
      method: {
        title: "The equation and its error bars",
        paragraphs: [
          "For men, body fat ≈ 86.010 × log₁₀(waist − neck) − 70.041 × log₁₀(height) + 36.76, with measurements in inches. The female version uses waist + hip − neck and different constants.",
          "The method assumes a typical fat distribution. It underestimates in very lean people and in those with a lot of abdominal fat, and it cannot distinguish visceral from subcutaneous fat — which is the part that matters most for health.",
        ],
        formula: "men: 86.010·log₁₀(waist−neck) − 70.041·log₁₀(height) + 36.76",
      },
      examples: [
        {
          title: "A moderately active man",
          steps: ["178 cm, neck 38 cm, waist 84 cm."],
          result: "About 16% body fat — the fitness band",
        },
        {
          title: "Tracking change",
          steps: ["Measure at the same time of day, monthly.", "Compare percentages rather than single readings."],
          result: "A trend over months is more meaningful than any one number",
        },
      ],
      limitations: [
        "A ±3–5 percentage point error against DEXA, and worse at the extremes.",
        "Measurement technique dominates the result: a centimetre at the waist is roughly a percentage point.",
        "Body fat percentage says nothing about fitness, visceral fat or metabolic health on its own.",
      ],
      faqs: [
        {
          q: "What is a healthy body fat percentage?",
          a: "Common reference bands are 14–17% for men and 21–24% for women in the fitness range, with 18–24% and 25–31% described as average. Health is not determined by this figure alone.",
        },
        {
          q: "How accurate is the Navy method?",
          a: "Typically within three to five percentage points of a DEXA scan. Consistent measurement matters more than absolute accuracy when you are tracking change.",
        },
        {
          q: "Why does it need my hip measurement?",
          a: "The female equation includes hip circumference because fat distribution differs; without it the estimate is not defined.",
        },
      ],
    },
  },
  {
    slug: "pace-calculator",
    name: "Pace Calculator",
    category: "everyday",
    tagline: "Pace per kilometre or mile, with even splits.",
    intent: "calculate running pace",
    keywords: ["pace calculator", "running pace", "min per km", "min per mile", "race pace", "split times"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 80,
    addedAt: "2025-03-06",
    seoTitle: "Pace Calculator — Minutes per Kilometre or Mile",
    seoDescription:
      "Convert a distance and a time into pace per kilometre or mile, average speed and even split times, using h:mm:ss input and exact unit conversion.",
    content: {
      intro: [
        "Pace is the number runners plan with, because it is the one that stays constant when the distance changes. A 50-minute 10K is five minutes per kilometre whether you think in miles or not.",
        "Enter a distance and a time in h:mm:ss and the tool returns pace, speed and the even splits for the whole run.",
      ],
      howTo: [
        "Enter the distance and choose kilometres or miles.",
        "Type the time as h:mm:ss or mm:ss.",
        "Read the pace and average speed.",
        "Use the split table to see where you should be at each marker.",
      ],
      method: {
        title: "Pace, speed and splits",
        paragraphs: [
          "Pace is time ÷ distance and speed is distance ÷ time — the same information inverted. A pace of 5:00 per kilometre equals 12 km/h; 8:00 per mile equals 7.5 mph.",
          "The split table multiplies the pace by each unit, which produces the target at every kilometre or mile marker. It is the difference between a plan and a hope on race day.",
        ],
        formula: "pace = time ÷ distance; speed = distance ÷ time",
      },
      examples: [
        {
          title: "A 10K in 50 minutes",
          steps: ["Distance 10 km, time 50:00."],
          result: "5:00 per km, 12 km/h, 5:00 splits at every marker",
        },
        {
          title: "A half marathon in miles",
          steps: ["Distance 13.1 miles, time 1:45:00."],
          result: "8:01 per mile, about 7.45 mph",
        },
      ],
      limitations: [
        "Even splits are an idealisation: hills, wind and crowded starts move the real pace around.",
        "Pace and speed assume steady effort; they say nothing about heart rate or perceived exertion.",
        "The conversion uses the international mile (1.609344 km), not a nautical mile.",
      ],
      faqs: [
        {
          q: "What is a good running pace?",
          a: "It depends entirely on experience and distance. A beginner might run 7:00–8:00 per km; a competitive club runner races under 4:00 per km. Compare with your own past races, not with strangers.",
        },
        {
          q: "How do I convert pace per km to pace per mile?",
          a: "Multiply the per-kilometre pace by 1.609344. A 5:00/km pace is about 8:03 per mile.",
        },
        {
          q: "Should I run even splits?",
          a: "For most races, yes — even or slightly negative splits produce the fastest times. Starting faster than target is the most common pacing mistake.",
        },
      ],
    },
  },
  {
    slug: "running-speed-calculator",
    name: "Running Speed Calculator",
    category: "everyday",
    tagline: "Speed, pace and equivalent race times from one run.",
    intent: "running speed calculator",
    keywords: ["running speed calculator", "running pace converter", "race time predictor", "riegel formula", "speed from distance and time", "5k pace"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 72,
    addedAt: "2025-03-06",
    seoTitle: "Running Speed Calculator — Pace and Race Equivalents",
    seoDescription:
      "Convert a run into average speed, pace per kilometre and mile, and Riegel race equivalents for 5K, 10K, half marathon and marathon.",
    content: {
      intro: [
        "One hard effort tells you more than a training plan chart: from a recent race you can estimate speed, pace and what the same fitness implies over other distances. This tool does the arithmetic and shows the projections.",
        "Equivalents use Riegel's formula, which assumes endurance scales predictably. That is a useful approximation and a poor promise, especially when moving up to the marathon.",
      ],
      howTo: [
        "Enter a distance you have run recently, in km or miles.",
        "Enter the time in h:mm:ss.",
        "Read average speed and pace in both units.",
        "Treat the race equivalents as training targets, then adjust for course and conditions.",
      ],
      method: {
        title: "Speed, pace and Riegel scaling",
        paragraphs: [
          "Speed is distance ÷ time, converted to km/h and mph. Pace is the inverse, shown per kilometre and per mile because race signage and training plans use different conventions.",
          "Riegel's formula projects a time for another distance: T₂ = T₁ × (D₂ ÷ D₁)^1.06. The 1.06 exponent captures the fatigue of longer races; it under-predicts for well-trained endurance runners and over-predicts for anyone moving up without the mileage.",
        ],
        formula: "T₂ = T₁ × (D₂ ÷ D₁)^1.06",
      },
      examples: [
        {
          title: "A 10K in 52:30",
          steps: ["Distance 10 km, time 52:30."],
          result: "11.43 km/h, 5:15 per km, 8:27 per mile",
        },
        {
          title: "Projecting a marathon",
          steps: ["Use the same 10K result."],
          result: "A projection near 4:10 — only realistic with marathon-specific training",
        },
      ],
      limitations: [
        "Race equivalents ignore training specificity: speed at 10K does not guarantee marathon endurance.",
        "Heat, hills and altitude can move a race time by minutes.",
        "The Riegel exponent is a population average; individuals differ, especially masters runners.",
      ],
      faqs: [
        {
          q: "How accurate are race time predictions?",
          a: "Close for similar distances and well-trained runners. The error grows with the jump in distance, often by five to ten minutes at marathon distance.",
        },
        {
          q: "What speed do I need for a sub-4 marathon?",
          a: "A marathon is 42.195 km, so 4:00:00 needs about 5:41 per km — roughly 10.55 km/h.",
        },
        {
          q: "Why do treadmill speeds feel harder outdoors?",
          a: "No wind resistance on a treadmill, but also no cooling and a forced cadence. Most runners find outdoor running slightly harder at the same nominal speed.",
        },
      ],
    },
  },
  {
    slug: "cooking-measurement-converter",
    name: "Cooking Measurement Converter",
    category: "everyday",
    tagline: "Cups, spoons, millilitres and grams — with density.",
    intent: "cooking measurement converter",
    keywords: ["cooking measurement converter", "cups to grams", "tablespoons to ml", "recipe measurements", "kitchen converter", "cups to ml"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 80,
    addedAt: "2025-03-06",
    seoTitle: "Cooking Measurement Converter — Cups, Spoons, Grams",
    seoDescription:
      "Convert cups, tablespoons, teaspoons, fluid ounces and millilitres, and see the weight in grams for flour, sugar, butter and other ingredients.",
    content: {
      intro: [
        "Kitchen conversions fail on density, not arithmetic. A US cup is 236.6 ml, but that cup weighs 125 g of flour and 340 g of honey — which is why an American cake recipe translated by volume alone comes out wrong.",
        "Enter an amount, choose a unit and pick the ingredient; the tool shows every kitchen volume plus the weight in grams for that ingredient.",
      ],
      howTo: [
        "Enter the amount, including fractions such as 1 1/2.",
        "Choose the unit the recipe uses.",
        "Pick the ingredient so the weight is meaningful.",
        "Read the equivalent volumes and the gram weight.",
      ],
      method: {
        title: "Volume first, weight second",
        paragraphs: [
          "Volumes convert through millilitres: one US cup is 236.588 ml, a tablespoon 14.787 ml, a teaspoon 4.929 ml. Metric cups are 250 ml, which is a 5.7% difference — enough to matter in baking.",
          "Weights come from a grams-per-cup density for each ingredient. Flour is the classic trap: scooping can pack in 20% more than spooning and levelling, which is why serious recipes specify 125 g per cup rather than a volume.",
        ],
        formula: "ml = amount × unit ml; grams = (ml ÷ 236.588) × grams per cup",
      },
      examples: [
        {
          title: "A cup of flour",
          steps: ["1 cup, all-purpose flour."],
          result: "236.6 ml and 125 g — not 236 g",
        },
        {
          title: "Australian recipe to US cups",
          steps: ["250 ml metric cup of milk."],
          result: "About 1.06 US cups, or 250 g",
        },
      ],
      limitations: [
        "Densities are approximations that vary by brand, grind and how the ingredient is packed.",
        "Australian tablespoons are 20 ml, not 15 ml, which breaks conversions by a third.",
        "For anything where texture matters — bread, pastry, custard — weigh rather than convert volume.",
      ],
      faqs: [
        {
          q: "How many grams are in a cup?",
          a: "It depends entirely on the ingredient: 125 g for flour, 200 g for granulated sugar, 227 g for butter, about 236 g for water or milk.",
        },
        {
          q: "Is a US cup the same as a metric cup?",
          a: "No — 236.6 ml versus 250 ml. The difference is small for liquids and noticeable in baking.",
        },
        {
          q: "Why does my tablespoon conversion look wrong?",
          a: "Check the country: US, UK and Australian tablespoons are 14.8, 17.8 and 20 ml respectively. This tool uses US measures unless labelled metric.",
        },
      ],
    },
  },
  {
    slug: "recipe-scaling-calculator",
    name: "Recipe Scaling Calculator",
    category: "everyday",
    tagline: "Scale a recipe to any number of servings.",
    intent: "scale a recipe",
    keywords: ["recipe scaling calculator", "recipe converter", "scale recipe servings", "halve a recipe", "double a recipe", "ingredient multiplier"],
    status: "live",
    actions: ["copy", "download"],
    effort: "instant",
    popularity: 72,
    addedAt: "2025-03-06",
    seoTitle: "Recipe Scaling Calculator — Any Number of Servings",
    seoDescription:
      "Scale a recipe's ingredients to any serving count, with kitchen-friendly fractions, old and new amounts side by side, and a copyable ingredient list.",
    content: {
      intro: [
        "Doubling a recipe is arithmetic; making the result taste right is not. This tool does the arithmetic cleanly — including fractions like 1 1/2 — and warns when the factor is far enough from 1 that cooking behaviour changes.",
        "Quantities snap to the nearest eighth of a teaspoon, because a measuring set cannot deliver 0.37 of a teaspoon.",
      ],
      howTo: [
        "Enter how many the recipe serves and how many you want.",
        "Type each ingredient with its quantity and unit.",
        "Fractions, decimals and text like “pinch” all work.",
        "Copy or download the scaled list.",
      ],
      method: {
        title: "Linear scaling and its exceptions",
        paragraphs: [
          "Every numeric quantity is multiplied by the serving ratio, then formatted to the nearest kitchen fraction. Non-numeric quantities such as “pinch” or “to taste” pass through unchanged, because scaling them is meaningless.",
          "Salt, leavening and strong spices rarely scale linearly. Pan volume scales with the cube of its dimensions, and larger batches lose proportionally less to evaporation, so a double batch usually needs slightly less liquid and a longer, slower bake.",
        ],
        formula: "scaled = original × (new servings ÷ old servings)",
      },
      examples: [
        {
          title: "Four servings to six",
          steps: ["1 1/2 cups flour, 2 eggs, 3/4 cup milk.", "Factor 1.5."],
          result: "2 1/4 cups flour, 3 eggs, 1 1/8 cups milk",
        },
        {
          title: "Halving a recipe",
          steps: ["Set 4 servings to 2."],
          result: "Every quantity halved, with an eighth-teaspoon floor",
        },
      ],
      limitations: [
        "It scales quantities, not technique: browning, reducing and resting times need judgement.",
        "Very small quantities round to the nearest eighth, which can lose precision in baking.",
        "Pan size, oven temperature and cooking time are not adjusted — those follow from the batch size, not the linear factor.",
      ],
      faqs: [
        {
          q: "Can I just double everything?",
          a: "For most savoury dishes yes, with a little less liquid. For baking, leavening and salt should be increased by less than double, and the pan size may need to change.",
        },
        {
          q: "How do I scale eggs?",
          a: "Whole eggs do not divide cleanly. For a half batch, beat an egg and weigh half of it — about 25 g for a large egg.",
        },
        {
          q: "Why does the tool warn at 4×?",
          a: "Beyond about four times, evaporation, pan depth and heat penetration change enough that the recipe needs rethinking rather than multiplying.",
        },
      ],
    },
  },
  {
    slug: "weight-converter",
    name: "Weight Converter",
    category: "everyday",
    tagline: "Kilograms, pounds, stone and ounces, exactly.",
    intent: "kg to lbs",
    keywords: ["weight converter", "kg to lbs", "pounds to kg", "stone to kg", "ounces to grams", "mass converter"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 86,
    addedAt: "2025-03-06",
    seoTitle: "Weight Converter — kg, lb, Stone and Ounces",
    seoDescription:
      "Convert between kilograms, pounds, stone, ounces and tonnes using exact definitions, with every unit shown at once and common weights for reference.",
    content: {
      intro: [
        "Body weight, luggage limits and shipping labels all use different units, and the conversions are exact rather than approximate: the international pound is defined as 0.45359237 kg.",
        "Enter a value in any supported unit and every other unit updates together, which makes cross-checking a label instant.",
      ],
      howTo: [
        "Type the weight.",
        "Choose the unit you typed it in.",
        "Read the value in every other unit.",
        "Copy the one the form or label needs.",
      ],
      method: {
        title: "Exact definitions",
        paragraphs: [
          "The pound has been defined as exactly 0.45359237 kg since 1959, and the ounce as one sixteenth of it. Stone is 14 pounds, used mainly in Britain and Ireland for body weight.",
          "Note the difference between mass and weight: kilograms measure mass, while pounds in everyday use also mean mass. The distinction only matters in physics, where weight is a force in newtons.",
        ],
        formula: "1 lb = 0.45359237 kg exactly",
      },
      examples: [
        {
          title: "A body weight",
          steps: ["70 kg → pounds and stone."],
          result: "154.3 lb, or 11 st 0.3 lb",
        },
        {
          title: "A shipping limit",
          steps: ["23 kg baggage allowance."],
          result: "50.7 lb — over a 50 lb limit",
        },
      ],
      limitations: [
        "US and UK hundredweight and ton differ; this converter uses the metric tonne and shows short/long tons in the table instead.",
        "Precious metals use troy ounces (31.103 g), not the avoirdupois ounce used here.",
        "Body weight fluctuates by a kilogram or more a day, so daily comparisons are noise.",
      ],
      faqs: [
        {
          q: "How many pounds is a kilogram?",
          a: "2.20462. Going the other way, one pound is 0.453592 kg.",
        },
        {
          q: "What is a stone in kilograms?",
          a: "6.35029 kg, which is 14 pounds.",
        },
        {
          q: "Is a US ton the same as a tonne?",
          a: "No. A metric tonne is 1,000 kg; a US short ton is 907.185 kg; a UK long ton is 1,016.05 kg.",
        },
      ],
    },
  },
  {
    slug: "length-converter",
    name: "Length Converter",
    category: "everyday",
    tagline: "Millimetres to nautical miles with exact factors.",
    intent: "length converter",
    keywords: ["length converter", "cm to inches", "km to miles", "feet to metres", "distance converter", "inches to mm"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 82,
    addedAt: "2025-03-06",
    seoTitle: "Length Converter — cm, Inches, Feet, Miles",
    seoDescription:
      "Convert lengths between millimetres, centimetres, metres, kilometres, inches, feet, yards, miles and nautical miles, with exact definitions.",
    content: {
      intro: [
        "Most length conversions are exact multiples of the metre, which makes them reliable in a way volume and cooking conversions are not. The inch is 25.4 mm by definition, so every imperial length conversion is exact.",
        "Use it for furniture dimensions, travel distances, screen sizes and anything that arrives with units from another country.",
      ],
      howTo: [
        "Enter the length and pick the unit.",
        "Read the equivalent in every supported unit.",
        "Use the nautical mile for sea or air distances.",
        "Copy the value into the document or form.",
      ],
      method: {
        title: "Exact imperial definitions",
        paragraphs: [
          "The 1959 agreement fixed the inch at 25.4 mm, the foot at 0.3048 m and the mile at 1,609.344 m. The nautical mile is 1,852 m, one minute of latitude, which is why aviation and shipping use it.",
          "All conversions pass through the metre, so precision never degrades with repeated conversion inside the tool. Very large or very small values are shown in scientific notation rather than with a wall of zeros.",
        ],
        formula: "1 in = 25.4 mm; 1 mi = 1609.344 m; 1 nmi = 1852 m",
      },
      examples: [
        {
          title: "A 5K run",
          steps: ["5 km → miles."],
          result: "3.107 miles",
        },
        {
          title: "A screen size",
          steps: ["27 inches → centimetres."],
          result: "68.58 cm — the diagonal",
        },
      ],
      limitations: [
        "The nautical mile is a different unit from the statute mile; do not substitute one for the other in navigation.",
        "Historic units such as the survey foot or the pre-1959 inch differ slightly and are not included.",
        "Distances on maps are straight-line; road distance is always longer.",
      ],
      faqs: [
        {
          q: "How many centimetres is an inch?",
          a: "Exactly 2.54 cm, by definition since 1959.",
        },
        {
          q: "Why is a nautical mile longer?",
          a: "It is defined as one minute of latitude, about 1,852 m, so a nautical mile corresponds directly to a minute on a chart.",
        },
        {
          q: "How do I convert feet and inches together?",
          a: "Convert feet to inches by multiplying by 12, add the inches, then use the converter. 5 ft 9 in is 69 in, or 175.26 cm.",
        },
      ],
    },
  },
  {
    slug: "area-converter",
    name: "Area Converter",
    category: "everyday",
    tagline: "Square metres, feet, acres and hectares for property.",
    intent: "area converter",
    keywords: ["area converter", "square metres to square feet", "acres to hectares", "sq ft to sq m", "land area converter", "square miles"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 70,
    addedAt: "2025-03-06",
    seoTitle: "Area Converter — m², ft², Acres and Hectares",
    seoDescription:
      "Convert between square metres, square feet, square yards, acres, hectares and square miles, with property-sized reference values for context.",
    content: {
      intro: [
        "Property listings mix units relentlessly: square feet in Britain, square metres in most of Europe, ping in Taiwan, tsubo in Japan. This converter covers the common metric and imperial units and shows the whole list at once.",
        "Linear conversions do not carry over to area — a factor of 3.28 becomes 10.76 when squared. Converting through square metres avoids that mistake.",
      ],
      howTo: [
        "Enter the area and choose its unit.",
        "Read the equivalent in every supported unit.",
        "Use the reference table to sanity-check the result.",
        "Copy the unit your listing or form needs.",
      ],
      method: {
        title: "Squared factors, and why acreage is odd",
        paragraphs: [
          "Each area unit is the square of its length unit, so 1 ft² = 0.09290304 m² and 1 mi² = 2.59 km². Areas pass through the square metre exactly as lengths pass through the metre.",
          "The acre is historical: 4,840 square yards, defined as the area a team of oxen could plough in a day. It is 4,046.86 m², and 640 acres make a square mile.",
        ],
        formula: "1 acre = 4046.8564224 m²; 1 hectare = 10,000 m²",
      },
      examples: [
        {
          title: "An apartment",
          steps: ["850 ft² → square metres."],
          result: "About 79 m²",
        },
        {
          title: "A plot of land",
          steps: ["2 hectares → acres."],
          result: "4.94 acres",
        },
      ],
      limitations: [
        "Floor area conventions differ — gross, net and usable area are not the same measurement.",
        "Plots are often described by boundaries rather than a surveyed area, so the figures in listings are approximate.",
        "Local units such as the Japanese tsubo or Hong Kong square foot are not included.",
      ],
      faqs: [
        {
          q: "How many square feet in a square metre?",
          a: "10.7639. To go the other way, one square foot is 0.092903 m².",
        },
        {
          q: "How big is an acre?",
          a: "About 4,047 m², roughly 90% of a football pitch, or 208 feet square.",
        },
        {
          q: "Is a hectare bigger than an acre?",
          a: "Yes — a hectare is 10,000 m², about 2.47 acres.",
        },
      ],
    },
  },
  {
    slug: "volume-converter",
    name: "Volume Converter",
    category: "everyday",
    tagline: "Litres, gallons (US and imperial), cups and spoons.",
    intent: "volume converter",
    keywords: ["volume converter", "litres to gallons", "ml to cups", "imperial gallons", "fluid ounces", "volume conversion"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 74,
    addedAt: "2025-03-06",
    seoTitle: "Volume Converter — Litres, US and Imperial Gallons",
    seoDescription:
      "Convert litres, millilitres, cubic metres, cups, pints, quarts and US or imperial gallons, with the differences that trip people up explained.",
    content: {
      intro: [
        "Volume is the unit family most likely to go wrong, because the US and imperial systems use the same names for different amounts. A US gallon is 3.785 litres; an imperial gallon is 4.546 — a 20% difference.",
        "Fuel economy, recipes and drinks labels all depend on which gallon is meant, so the table on the page spells out the differences rather than leaving them implicit.",
      ],
      howTo: [
        "Enter the volume and select its unit.",
        "Read every equivalent, including both gallon types.",
        "Check which system the label or recipe uses.",
        "Copy the value into your document.",
      ],
      method: {
        title: "Two systems, same words",
        paragraphs: [
          "Everything converts through the litre. The US fluid ounce is 29.574 ml, the imperial fluid ounce 28.413 ml, and a US gallon is 128 US fluid ounces while an imperial gallon is 160 imperial ones.",
          "Cooking volumes are US customary in most American recipes: a cup is 236.588 ml. Australian and European recipes often use a 250 ml metric cup, which is close enough for liquids and not close enough for baking.",
        ],
        formula: "1 US gal = 3.785411784 L; 1 imp gal = 4.54609 L",
      },
      examples: [
        {
          title: "A fuel figure",
          steps: ["10 US gallons → litres."],
          result: "37.85 L, where 10 imperial gallons would be 45.46 L",
        },
        {
          title: "A recipe",
          steps: ["2 cups → millilitres."],
          result: "473.2 ml, just under half a litre",
        },
      ],
      limitations: [
        "US and imperial measures are not interchangeable, and neither are US and Australian tablespoons.",
        "Cubic metres are used for gas billing and bulk materials, where a litre figure is unhelpfully small.",
        "Volume-to-weight requires a density; use the cooking converter for that.",
      ],
      faqs: [
        {
          q: "How many litres in a gallon?",
          a: "3.785 in the US and 4.546 in the UK and most of the Commonwealth. Always check which is meant.",
        },
        {
          q: "How many ml in a cup?",
          a: "236.588 ml for a US cup, 250 ml for a metric cup.",
        },
        {
          q: "How many ounces in a litre?",
          a: "About 33.8 US fluid ounces, or 35.2 imperial fluid ounces.",
        },
      ],
    },
  },
  {
    slug: "speed-converter",
    name: "Speed Converter",
    category: "everyday",
    tagline: "km/h, mph, m/s, knots and feet per second.",
    intent: "speed converter",
    keywords: ["speed converter", "kmh to mph", "mph to kmh", "knots to kmh", "m/s to kmh", "velocity converter"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 78,
    addedAt: "2025-03-06",
    seoTitle: "Speed Converter — km/h, mph, Knots and m/s",
    seoDescription:
      "Convert speeds between kilometres per hour, miles per hour, metres per second, feet per second and knots, with everyday reference speeds.",
    content: {
      intro: [
        "Speed units are all ratios of distance to time, so any conversion is exact once you know the base factor: 1 m/s is 3.6 km/h, and 1 mph is 0.44704 m/s.",
        "Knots are included because aviation and marine forecasts still use them, and because a knot is a nautical mile per hour — not a statute mile per hour.",
      ],
      howTo: [
        "Enter the speed and pick its unit.",
        "Read the equivalent in all five units.",
        "Use knots for marine and aviation figures.",
        "Copy the value you need.",
      ],
      method: {
        title: "One base unit, exact factors",
        paragraphs: [
          "Every value is converted to metres per second first: km/h divides by 3.6, mph multiplies by 0.44704, knots by 0.514444. Feet per second is 0.3048 m/s.",
          "The reference table gives anchors — 100 km/h is 62.1 mph, and walking pace is near 5 km/h — which makes a converted number checkable at a glance.",
        ],
        formula: "1 m/s = 3.6 km/h = 2.237 mph = 1.944 kn",
      },
      examples: [
        {
          title: "A speed limit",
          steps: ["70 mph → km/h."],
          result: "112.65 km/h",
        },
        {
          title: "A wind forecast",
          steps: ["25 knots → km/h and mph."],
          result: "46.3 km/h, or 28.8 mph",
        },
      ],
      limitations: [
        "Air and road speeds are usually given as ground speed versus indicated speed; a converter cannot reconcile them.",
        "Mach number depends on temperature and altitude, so it is not a fixed unit.",
        "Acceleration and velocity direction are out of scope — this converts magnitude only.",
      ],
      faqs: [
        {
          q: "How do I convert km/h to mph quickly?",
          a: "Multiply by 0.6214, or roughly take 60% and add a little. 100 km/h is 62.1 mph.",
        },
        {
          q: "What is a knot?",
          a: "One nautical mile per hour, or 1.852 km/h. It is used at sea and in the air because nautical miles map to degrees of latitude.",
        },
        {
          q: "Why is m/s used in physics?",
          a: "It is the SI unit, so equations involving acceleration, force and energy work without conversion factors.",
        },
      ],
    },
  },
  {
    slug: "fuel-consumption-converter",
    name: "Fuel Consumption Converter",
    category: "everyday",
    tagline: "L/100 km, mpg (US and UK) and cost per distance.",
    intent: "fuel consumption calculator",
    keywords: ["fuel consumption calculator", "mpg to l/100km", "fuel economy converter", "petrol cost per km", "l/100km to mpg", "fuel cost calculator"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 72,
    addedAt: "2025-03-06",
    seoTitle: "Fuel Consumption Converter — MPG and L/100 km",
    seoDescription:
      "Convert fuel consumption between L/100 km, US and UK mpg and km per litre, and work out the fuel cost per 100 km from a price per litre.",
    content: {
      intro: [
        "Fuel economy is the one place where two systems invert the meaning: L/100 km rewards a low number, mpg rewards a high one. Converting between them is not a simple multiplication, which is why the wrong figure is easy to quote.",
        "Enter a distance and the fuel used — the tank-to-tank method — and the tool returns every common measure plus the cost per 100 km.",
      ],
      howTo: [
        "Fill the tank, reset the trip, drive normally, then fill again.",
        "Enter the distance covered and the litres used at the second fill.",
        "Add the price per litre for a cost figure.",
        "Compare mpg US, mpg UK and L/100 km on the same row.",
      ],
      method: {
        title: "Why the two mpg figures differ",
        paragraphs: [
          "US mpg = 235.215 ÷ (L/100 km); UK mpg = 282.481 ÷ (L/100 km). The constant differs because an imperial gallon is 4.546 litres and a US gallon 3.785, so the same car always looks about 20% more efficient in Britain.",
          "Consumption is litres ÷ distance × 100, and cost per 100 km is that figure multiplied by the pump price. Motorway driving, tyre pressure and roof racks move the number more than most drivers expect.",
        ],
        formula: "L/100 km = litres ÷ km × 100; US mpg = 235.215 ÷ (L/100 km)",
      },
      examples: [
        {
          title: "A tank-to-tank check",
          steps: ["500 km on 40 litres."],
          result: "8.0 L/100 km, 29.4 mpg US, 35.3 mpg UK",
        },
        {
          title: "Costing a commute",
          steps: ["500 km, 40 L, price 1.75 per litre."],
          result: "14.00 per 100 km — about 70.00 for the tank",
        },
      ],
      limitations: [
        "A single tank includes driving conditions that may not repeat; average over three or more fills.",
        "Trip computers are typically 5–10% optimistic compared with the pump.",
        "mpg figures from different countries are not comparable unless the gallon is stated.",
      ],
      faqs: [
        {
          q: "Is higher mpg better?",
          a: "Yes — more miles per gallon means less fuel used. With L/100 km the relationship inverts, so lower is better.",
        },
        {
          q: "How do I convert 30 mpg to L/100 km?",
          a: "If that is US mpg, divide 235.215 by 30 to get 7.84 L/100 km. For UK mpg, divide 282.481 by 30 for 9.42.",
        },
        {
          q: "Why does my car's display differ from the pump?",
          a: "The car measures fuel flow and distance approximately, and tyre wear changes the rolling circumference. The pump calculation is the reference.",
        },
      ],
    },
  },
  {
    slug: "electricity-consumption-calculator",
    name: "Electricity Consumption Calculator",
    category: "everyday",
    tagline: "What an appliance costs to run, in kWh and money.",
    intent: "electricity cost calculator",
    keywords: ["electricity cost calculator", "kwh calculator", "appliance running cost", "energy consumption calculator", "electric bill calculator", "power cost"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 76,
    addedAt: "2025-03-06",
    seoTitle: "Electricity Consumption Calculator — Appliance Cost",
    seoDescription:
      "Work out how many kWh an appliance uses from its wattage and hours, then what that costs at your tariff and how much CO₂ it produces.",
    content: {
      intro: [
        "Every appliance label gives watts; every bill charges kilowatt-hours. The gap between them is hours of use, which is why a 9 W bulb can cost less per year than a 2 kW heater used for an hour a day.",
        "Enter the wattage, daily hours, days and your tariff to see kWh, cost per day, cost for the period and the associated emissions.",
      ],
      howTo: [
        "Find the wattage on the label or in the manual.",
        "Estimate realistic hours per day — most appliances cycle.",
        "Enter your tariff per kWh from the bill.",
        "Read the period cost and the daily figure.",
      ],
      method: {
        title: "Watts, hours and the meter",
        paragraphs: [
          "One kilowatt-hour is 1,000 watts for one hour. So kWh = watts × hours ÷ 1,000, and cost is kWh × tariff. A 2,000 W heater for two hours a day uses 4 kWh daily.",
          "Nameplate wattage is a maximum. Fridges and air conditioners cycle, so their effective hours are far below plugged-in hours; the appliance table gives typical values to start from.",
        ],
        formula: "kWh = watts × hours ÷ 1000; cost = kWh × tariff",
      },
      examples: [
        {
          title: "A heater",
          steps: ["2,000 W, 2 hours a day, 30 days, 0.20 per kWh."],
          result: "120 kWh, costing 24.00 for the month",
        },
        {
          title: "A laptop",
          steps: ["65 W, 8 hours a day, 30 days."],
          result: "15.6 kWh — about a tenth of the heater",
        },
      ],
      limitations: [
        "Cycling appliances use far less than nameplate × hours; a fridge averages perhaps a quarter of its rating.",
        "Standby draw is not modelled, though it can add 5–10% to a household total.",
        "Tariffs with standing charges, time-of-use rates or tiered pricing need a blended figure rather than a single rate.",
      ],
      faqs: [
        {
          q: "How much does 1 kWh cost?",
          a: "It depends entirely on where you are and your tariff. Enter the rate from your bill — this tool does not assume a price.",
        },
        {
          q: "How do I read an appliance's wattage?",
          a: "Look for a label with W or watts, or volts × amps. If only an energy rating is given, the annual kWh figure is more useful for comparison.",
        },
        {
          q: "Do phone chargers waste power when plugged in?",
          a: "Modern chargers draw under 0.3 W at idle, which is a few pence a year. Older adapters and always-on devices matter more.",
        },
      ],
    },
  },
  {
    slug: "countdown-timer",
    name: "Countdown Timer",
    category: "everyday",
    tagline: "A precise countdown that keeps running in a background tab.",
    intent: "countdown timer",
    keywords: ["countdown timer", "online timer", "set a timer", "egg timer", "minute timer", "countdown clock"],
    status: "live",
    actions: [],
    effort: "instant",
    popularity: 82,
    addedAt: "2025-03-06",
    seoTitle: "Countdown Timer — Accurate Online Timer",
    seoDescription:
      "Set a countdown in hours, minutes and seconds with quick presets, watch the progress bar and see exactly what time it finishes.",
    content: {
      intro: [
        "A timer is only useful if it is accurate when the tab is in the background. Browsers throttle timers in inactive tabs, so this one computes the remaining time from the system clock instead of counting its own ticks.",
        "Presets cover the usual cases — five minutes, ten, a Pomodoro block, an hour — and any duration can be typed in.",
      ],
      howTo: [
        "Type hours, minutes and seconds, or pick a preset.",
        "Press start.",
        "Leave the tab open — the bar shows progress.",
        "Press pause or reset as needed.",
      ],
      method: {
        title: "Clock-based, so throttling does not matter",
        paragraphs: [
          "When the timer starts, the end time is calculated once as now + remaining. Every tick compares the current clock with that end time, so a tab that only refreshes twice a second still shows the correct second.",
          "A browser tab cannot ring after it is closed, and it cannot schedule a notification without permission. Both limitations are stated on the page rather than hidden behind a false promise.",
        ],
        formula: "remaining = end − now",
      },
      examples: [
        {
          title: "A five-minute task",
          steps: ["Choose the 5 min preset.", "Start."],
          result: "A countdown that finishes at the time shown under the display",
        },
        {
          title: "Pausing",
          steps: ["Start a 10-minute timer.", "Pause after two minutes."],
          result: "Eight minutes remain and stay frozen until you resume",
        },
      ],
      limitations: [
        "Closing or reloading the tab ends the timer; nothing is stored or scheduled.",
        "No sound or notification is triggered, because a page cannot guarantee either without permission.",
        "Accuracy depends on your device clock being correct.",
      ],
      faqs: [
        {
          q: "Does the timer keep running in a background tab?",
          a: "Yes. Browsers throttle intervals, but the remaining time is recalculated from the clock each tick, so it stays accurate.",
        },
        {
          q: "Will it ring when it finishes?",
          a: "No. It shows that the countdown reached zero. Browsers require user permission for sound and notifications, and this page does not request them.",
        },
        {
          q: "Can I run several timers?",
          a: "Open the page in several tabs — each has its own independent timer.",
        },
      ],
    },
  },
  {
    slug: "stopwatch",
    name: "Stopwatch",
    category: "everyday",
    tagline: "Start, stop, lap — with hundredths and fastest-lap marks.",
    intent: "online stopwatch",
    keywords: ["online stopwatch", "stopwatch with laps", "lap timer", "timer stopwatch", "free stopwatch", "millisecond stopwatch"],
    status: "live",
    actions: [],
    effort: "instant",
    popularity: 80,
    addedAt: "2025-03-06",
    seoTitle: "Stopwatch — Start, Stop and Lap Times",
    seoDescription:
      "A browser stopwatch with start, pause, lap recording and fastest and slowest lap marks, measured from the system clock rather than interval counting.",
    content: {
      intro: [
        "Interval-based stopwatches drift: every tick is a few milliseconds late and the error accumulates. This one records a start timestamp and subtracts, so the reading is taken from the system clock and does not drift.",
        "Laps record the running total; the table shows each lap segment, the total at that point and marks the fastest and slowest.",
      ],
      howTo: [
        "Press start.",
        "Press lap at each split — the timer keeps running.",
        "Press pause to stop, then resume to continue.",
        "Press reset to clear everything.",
      ],
      method: {
        title: "Timestamps instead of ticks",
        paragraphs: [
          "On start, the clock is stored. Elapsed time is now minus start, plus any time accumulated before a pause. This is why a backgrounded tab does not gain or lose time.",
          "The display refreshes about 25 times a second for readability. Browser timers are accurate to a few milliseconds, which is fine for workouts and unsuitable for officiating.",
        ],
        formula: "elapsed = (now − start) + accumulated",
      },
      examples: [
        {
          title: "Interval training",
          steps: ["Lap every 60 seconds.", "Read the fastest and slowest laps."],
          result: "Lap list with the outliers marked",
        },
        {
          title: "Pausing mid-task",
          steps: ["Start, pause, resume."],
          result: "Paused time is excluded from the total",
        },
      ],
      limitations: [
        "Hundredths are displayed but not guaranteed: browser timing granularity is a few milliseconds.",
        "Laps and elapsed time are lost on reload — nothing is stored.",
        "It cannot run with the screen locked on some mobile browsers.",
      ],
      faqs: [
        {
          q: "Does it keep time when the tab is in the background?",
          a: "Yes. The elapsed time is computed from timestamps, so throttled updates do not cause drift.",
        },
        {
          q: "Can I keep my laps after closing the tab?",
          a: "No. Copy the table before closing if you need the numbers.",
        },
        {
          q: "Is it accurate enough for racing?",
          a: "For training, yes. For official timing you need hardware with a real oscillator and a calibrated start signal.",
        },
      ],
    },
  },
  {
    slug: "pomodoro-timer",
    name: "Pomodoro Timer",
    category: "everyday",
    tagline: "Focus and break cycles with automatic phase changes.",
    intent: "pomodoro timer",
    keywords: ["pomodoro timer", "pomodoro technique", "focus timer", "25 minute timer", "study timer", "work break timer"],
    status: "live",
    actions: [],
    effort: "instant",
    popularity: 78,
    addedAt: "2025-03-06",
    seoTitle: "Pomodoro Timer — Focus Cycles and Breaks",
    seoDescription:
      "Run Pomodoro focus and break cycles with adjustable durations, automatic phase changes, round counting and a running total of focused minutes.",
    content: {
      intro: [
        "The Pomodoro technique is a commitment device: 25 minutes is short enough to start, and a five-minute break is short enough to keep the next block attractive. The specific numbers matter less than the rhythm.",
        "Durations are adjustable, the transition to a long break is automatic after the round count, and the total focused time is tracked for the session.",
      ],
      howTo: [
        "Set the focus, short-break and long-break lengths.",
        "Choose how many rounds before a long break.",
        "Press start and work until the phase ends.",
        "Take the break; the timer moves on by itself.",
      ],
      method: {
        title: "Why the cycle works",
        paragraphs: [
          "A defined end point reduces the perceived cost of starting, and a scheduled break prevents the slow drift into distraction that happens without one. The break is part of the method, not a reward for finishing.",
          "Tracking completed rounds makes the day measurable. Someone who completes eight rounds has four hours of focused work, which is a realistic ceiling for most knowledge work.",
        ],
        formula: "focus 25 min → break 5 min → every 4th break 15 min",
      },
      examples: [
        {
          title: "A writing session",
          steps: ["Four rounds of 25/5.", "Long break after the fourth."],
          result: "100 minutes of focus with three short breaks and one long one",
        },
        {
          title: "A longer deep-work block",
          steps: ["Set focus to 50 and break to 10."],
          result: "The same structure at a length that suits the task",
        },
      ],
      limitations: [
        "Fixed intervals suit tasks that can be interrupted; they can break flow on long creative work.",
        "The timer requires the tab to stay open and does not play a sound.",
        "Rounds and focused minutes reset on reload — nothing is stored.",
      ],
      faqs: [
        {
          q: "Why 25 minutes?",
          a: "It is a historical default, not a scientific optimum. What matters is a bounded block with a real break; 50/10 works better for many deep tasks.",
        },
        {
          q: "What should I do during a break?",
          a: "Stand up, look at something far away and move. Scrolling a feed keeps attention engaged and defeats the purpose.",
        },
        {
          q: "Does the timer notify me when a phase ends?",
          a: "It changes phase on screen but does not play a sound or send a notification, so keep the tab visible.",
        },
      ],
    },
  },
  {
    slug: "world-clock",
    name: "World Clock",
    category: "everyday",
    tagline: "Live times in the cities you actually deal with.",
    intent: "world clock",
    keywords: ["world clock", "current time in cities", "time in tokyo", "time zone clock", "world time now", "international meeting time"],
    status: "live",
    actions: [],
    effort: "instant",
    popularity: 80,
    addedAt: "2025-03-06",
    seoTitle: "World Clock — Live Time in Multiple Cities",
    seoDescription:
      "See the current time and UTC offset in several cities at once, add or remove locations, and read daylight-saving-aware times from your browser.",
    content: {
      intro: [
        "A world clock is only right if it understands daylight saving, which changes twice a year in many countries and not at all in others. Times here come from the browser's IANA time-zone database, so the offset shown already includes the current rules.",
        "Start with a few cities and add the ones you actually work with; each row shows the local time, the date and the offset from UTC.",
      ],
      howTo: [
        "Add a city from the list.",
        "Read its time, date and UTC offset.",
        "Compare with your own device time at the top.",
        "Remove cities you do not need.",
      ],
      method: {
        title: "Zones, offsets and DST",
        paragraphs: [
          "Every time is formatted with Intl.DateTimeFormat in the target zone, and the offset is computed by comparing the zone's wall clock with UTC. That handles half-hour zones such as India and Nepal's 45-minute offset without special cases.",
          "Daylight saving is applied automatically because the rules live in the time-zone database, not in the page. Two cities that are usually eight hours apart can be seven during the weeks when their transitions differ.",
        ],
        formula: "offset = wall clock in zone − UTC",
      },
      examples: [
        {
          title: "A call between Lagos and New York",
          steps: ["Add both cities.", "Compare the offsets."],
          result: "Lagos is UTC+1 all year; New York moves between UTC−5 and UTC−4",
        },
        {
          title: "A half-hour zone",
          steps: ["Add Mumbai."],
          result: "UTC+05:30, shown without rounding",
        },
      ],
      limitations: [
        "Your device's zone database may be out of date if the browser has not been updated after a rule change.",
        "It shows the current time, not a meeting planner — it does not model a specific future date's offsets.",
        "Nothing is saved: the city list resets on reload.",
      ],
      faqs: [
        {
          q: "Does it handle daylight saving?",
          a: "Yes. Times come from the browser's time-zone data, which applies the current DST rules for each zone.",
        },
        {
          q: "Why is the offset different from last month?",
          a: "One of the zones changed to or from daylight saving. Offsets shift by an hour around those dates, and the two countries may change on different days.",
        },
        {
          q: "Can I plan a meeting for next week?",
          a: "Not here — this shows the current time. Use the time zone converter to compare a specific date and hour.",
        },
      ],
    },
  },
];
