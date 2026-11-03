"use client";

import { UnitFamilyTool } from "@/components/tools/unit-family-tool";

export default function VolumeConverter() {
  return (
    <UnitFamilyTool
      family="volume"
      defaultFrom="l"
      defaultTo="gal"
      defaultValue="10"
      hint="Litres, millilitres, US and imperial gallons, cups and spoons."
      presets={[
        { label: "1 US gal", value: "3.785411784" },
        { label: "1 imp gal", value: "4.54609" },
        { label: "1 cup", value: "0.2365882365" },
        { label: "500 ml", value: "0.5" },
      ]}
      commonTable={{
        caption: "Where volume conversions go wrong",
        rows: [
          ["Measure", "Value"],
          ["1 US gallon", "3.785 L (231 in³)"],
          ["1 imperial gallon", "4.546 L (20% larger)"],
          ["1 US cup", "236.6 ml"],
          ["1 metric cup", "250 ml"],
          ["1 US fluid ounce", "29.574 ml"],
          ["1 imperial fluid ounce", "28.413 ml"],
          ["1 US tablespoon", "14.787 ml"],
        ],
      }}
    />
  );
}
