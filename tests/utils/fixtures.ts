import { readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const fixturesDirectory = new URL("../fixtures/", import.meta.url);
const snapshotsDirectory = new URL("../snaps/", import.meta.url);

export async function listFixtures(): Promise<string[]> {
  const files = await readdir(fixturesDirectory, { recursive: true });

  return files
    .filter((file) => file.endsWith(".msbt"))
    .map((file) => file.replaceAll("\\", "/"))
    .toSorted();
}

export function fixturePath(file: string): string {
  return fileURLToPath(new URL(file, fixturesDirectory));
}

export function snapshotPath(file: string): string {
  return fileURLToPath(new URL(`${file}.snap`, snapshotsDirectory));
}
