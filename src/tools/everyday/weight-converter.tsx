"use client";

import { UnitFamilyTool } from "@/components/tools/unit-family-tool";

export default function WeightConverter() {
  return (
    <UnitFamilyTool
      family="mass"
      defaultFrom="kg"
      defaultTo="lb"
      defaultValue="70"
      hint="Kilograms, pounds, ounces, stone and tonnes."
      presets={[
        { label: "1 kg", value: "1" },
        { label: "70 kg", value: "70" },
        { label: "150 lb", value: "68.0388555" },
        { label: "11 st", value: "69.85322498" },
      ]}
      commonTable={{
        caption: "Everyday weight references",
        rows: [
          ["Quantity", "Equals"],
          ["1 pound", "453.592 g"],
          ["1 stone", "14 lb = 6.350 kg"],
          ["1 ounce", "28.3495 g"],
          ["1 metric tonne", "1000 kg = 2204.62 lb"],
          ["1 US short ton", "907.185 kg"],
          ["1 UK long ton", "1016.05 kg"],
        ],
      }}
    />
  );
}
