"use client";

import { UnitFamilyTool } from "@/components/tools/unit-family-tool";

export default function AreaConverter() {
  return (
    <UnitFamilyTool
      family="area"
      defaultFrom="m2"
      defaultTo="ft2"
      defaultValue="100"
      hint="Square metres, square feet, acres, hectares and more."
      presets={[
        { label: "1 acre", value: "4046.8564224" },
        { label: "100 m²", value: "100" },
        { label: "1000 ft²", value: "92.90304" },
        { label: "1 hectare", value: "10000" },
      ]}
      commonTable={{
        caption: "Property and land references",
        rows: [
          ["Quantity", "Equals"],
          ["1 acre", "4046.86 m² = 43,560 ft²"],
          ["1 hectare", "10,000 m² = 2.471 acres"],
          ["1 square mile", "640 acres = 2.59 km²"],
          ["1 square yard", "9 ft² = 0.836 m²"],
          ["Football pitch (approx.)", "0.7 hectares"],
        ],
      }}
    />
  );
}
