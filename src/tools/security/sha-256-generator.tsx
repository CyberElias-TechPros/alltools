"use client";

import { HashTool } from "@/components/tools/hash-tool";

export default function Sha256Generator() {
  return <HashTool id="sha-256-generator" algorithms={["SHA-256"]} defaultAlgorithm="SHA-256" />;
}
