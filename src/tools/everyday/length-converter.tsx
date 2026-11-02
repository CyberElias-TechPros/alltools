"use client";

import { UnitFamilyTool } from "@/components/tools/unit-family-tool";

export default function LengthConverter() {
  return (
    <UnitFamilyTool
      family="length"
      defaultFrom="km"
      defaultTo="mi"
      defaultValue="5"
      hint="Millimetres to nautical miles, with exact definitions."
      presets={[
        { label: "1 mile", value: "1.609344" },
        { label: "5 km", value: "5" },
        { label: "1 inch", value: "25.4" },
        { label: "1 m", value: "1000" },
      ]}
      commonTable={{
        caption: "Definitions worth knowing",
        rows: [
          ["Unit", "Exact value"],
          ["1 inch", "25.4 mm"],
          ["1 foot", "0.3048 m"],
          ["1 yard", "0.9144 m"],
          ["1 mile", "1609.344 m"],
          ["1 nautical mile", "1852 m"],
          ["1 metre (original)", "1/10,000,000 of the Paris meridian"],
        ],
      }}
    />
  );
}
