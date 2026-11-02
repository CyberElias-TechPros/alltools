"use client";

import { HashTool } from "@/components/tools/hash-tool";

export default function FileChecksumCalculator() {
  return (
    <HashTool
      id="file-checksum-calculator"
      algorithms={["MD5", "SHA-1", "SHA-256", "SHA-512"]}
      defaultAlgorithm="SHA-256"
      fileFirst
    />
  );
}
