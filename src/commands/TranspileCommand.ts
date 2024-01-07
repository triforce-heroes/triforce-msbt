import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { normalize } from "node:path";

import { fatal } from "@triforce-heroes/triforce-core";

import { rebuild } from "../Rebuilder.js";
import { transpile } from "../Transpile.js";

export function TranspileCommand(input: string) {
  if (!existsSync(input)) {
    fatal(`File not found: ${input}`);
  }

  const outputNormalized = normalize(`${input}.json`);

  process.stdout.write(
    `Extracting ${normalize(input)} to ${outputNormalized}... `,
  );

  const inputData = readFileSync(input);
  const transpiled = transpile(inputData);

  writeFileSync(outputNormalized, JSON.stringify(transpiled, null, 2));

  const rebuilded = rebuild(transpiled);

  if (!rebuilded.equals(inputData)) {
    process.stdout.write("MISMATCH\n");

    writeFileSync(`${outputNormalized}.rebuilded`, rebuilded);

    return;
  }

  process.stdout.write("OK\n");
}
