import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename, normalize } from "node:path";

import { fatal } from "@triforce-heroes/triforce-core";

import { rebuild } from "../Rebuilder.js";
import { DataEntry } from "../types/DataEntry.js";

export function RebuildCommand(input: string) {
  if (!existsSync(input)) {
    fatal(`File not found: ${input}`);
  }

  const outputNormalized = normalize(basename(input, ".json"));

  process.stdout.write(
    `Rebuilding ${normalize(input)} to ${outputNormalized}... `,
  );

  writeFileSync(
    outputNormalized,
    rebuild(JSON.parse(readFileSync(input, "utf8")) as DataEntry[][]),
  );

  process.stdout.write("OK\n");
}
