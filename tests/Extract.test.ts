import { readFile } from "node:fs/promises";

import { beforeAll, describe, expect, it } from "vitest";

import { extract } from "#/Extract";
import { fixturePath, listFixtures, snapshotPath } from "#tests/utils/fixtures";

const fixtures = await listFixtures();

describe(extract, () => {
  beforeAll(() => {
    // Escape binary control characters so snapshots remain readable text files.
    expect.addSnapshotSerializer({
      test: (value) => typeof value === "string",
      serialize: (value: string) => JSON.stringify(value),
    });
  });

  it("discovers MSBT fixtures", () => {
    expect(fixtures.length).toBeGreaterThan(0);
  });

  it("decodes UTF-16 text instead of exposing its bytes", async () => {
    expect.assertions(2);

    const source = await readFile(fixturePath("en_US/0-Common/001-Action.msbt"));
    const originalSource = Buffer.from(source);
    const entries = extract(source);

    expect(entries.find(([label]) => label === "ACT_DO_001")).toStrictEqual([
      "ACT_DO_001",
      "Climb up",
    ]);
    expect(source).toStrictEqual(originalSource);
  });

  it.each(fixtures)("extract(%s)", async (file) => {
    expect.assertions(1);

    const source = await readFile(fixturePath(file));
    const entries = extract(source);

    await expect(entries).toMatchFileSnapshot(snapshotPath(file));
  });
});
