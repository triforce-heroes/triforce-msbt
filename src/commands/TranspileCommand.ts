import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { normalize } from "node:path";

import { fatal } from "@triforce-heroes/triforce-core";

import { transpile } from "../Transpile.js";

export function TranspileCommand(input: string) {
  if (!existsSync(input)) {
    fatal(`File not found: ${input}`);
  }

  const outputNormalized = normalize(`${input}.json`);

  process.stdout.write(
    `Extracting ${normalize(input)} to ${outputNormalized}... `,
  );

  writeFileSync(
    outputNormalized,
    JSON.stringify(transpile(readFileSync(input)), null, 2),
  );

  process.stdout.write("OK\n");
}
