"use client";

import { HashTool } from "@/components/tools/hash-tool";

export default function Sha512Generator() {
  return <HashTool id="sha-512-generator" algorithms={["SHA-512"]} defaultAlgorithm="SHA-512" />;
}
