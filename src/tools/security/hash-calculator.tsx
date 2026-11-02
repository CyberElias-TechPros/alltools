"use client";

import { HashTool } from "@/components/tools/hash-tool";

export default function HashCalculator() {
  return (
    <HashTool
      id="hash-calculator"
      algorithms={["MD5", "SHA-1", "SHA-256", "SHA-384", "SHA-512"]}
      defaultAlgorithm="SHA-256"
    />
  );
}
