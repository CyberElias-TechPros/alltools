"use client";

import { UnitFamilyTool } from "@/components/tools/unit-family-tool";

export default function SpeedConverter() {
  return (
    <UnitFamilyTool
      family="speed"
      defaultFrom="kph"
      defaultTo="mph"
      defaultValue="100"
      hint="km/h, mph, metres per second, feet per second and knots."
      presets={[
        { label: "50 km/h", value: "50" },
        { label: "70 mph", value: "112.65408" },
        { label: "1 knot", value: "0.514444444" },
        { label: "10 m/s", value: "10" },
      ]}
      commonTable={{
        caption: "Speed references",
        rows: [
          ["Speed", "Meaning"],
          ["30 km/h", "Typical urban limit (18.6 mph)"],
          ["100 km/h", "62.1 mph"],
          ["1 knot", "1 nautical mile per hour = 1.852 km/h"],
          ["Mach 1 (sea level)", "≈ 1235 km/h"],
          ["Walking pace", "≈ 5 km/h"],
        ],
      }}
    />
  );
}
