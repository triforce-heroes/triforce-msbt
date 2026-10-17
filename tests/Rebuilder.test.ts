import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { extract } from "#/Extract";
import { rebuild } from "#/Rebuilder";
import { fixturePath, listFixtures } from "#tests/utils/fixtures";

const fixtures = await listFixtures();

describe(rebuild, () => {
  it.each(fixtures)("rebuilds %s byte for byte after extraction", async (file) => {
    expect.assertions(1);

    const source = await readFile(fixturePath(file));
    const entries = extract(source);
    const rebuilt = rebuild(source, new Map(entries));

    expect(rebuilt.equals(source), `Rebuilt bytes differ for ${file}`).toBe(true);
  });

  it.each(fixtures)("preserves %s with no replacements", async (file) => {
    expect.assertions(1);

    const source = await readFile(fixturePath(file));
    const rebuilt = rebuild(source, new Map());

    expect(rebuilt.equals(source), `Rebuilt bytes differ for ${file}`).toBe(true);
  });

  const replacementsSamples: Array<[scenario: string, replacement: string]> = [
    ["replaces only matching labels", "Olá, 世界! 🎮\nAção"],
    ["accepts empty replacements", ""],
  ];

  it.each(replacementsSamples)("%s", async (_, replacement) => {
    expect.assertions(4);

    const source = await readFile(fixturePath("en_US/0-Common/001-Action.msbt"));
    const originalSource = Buffer.from(source);
    const entries = extract(source);
    const [label] = entries.at(0)!;
    const replacements = new Map([[label, replacement]]);
    const rebuilt = rebuild(source, replacements);
    const expected = entries.with(0, [label, replacement]);

    expect(extract(rebuilt)).toStrictEqual(expected);
    expect(source).toStrictEqual(originalSource);
    expect(replacements).toStrictEqual(new Map([[label, replacement]]));
    expect(rebuilt.equals(source)).toBe(false);
  });

  it("ignores unknown labels and preserves source order", async () => {
    expect.assertions(2);

    const source = await readFile(fixturePath("en_US/0-Common/001-Action.msbt"));
    const entries = extract(source);
    const replacements = new Map([...entries.toReversed(), ["UnknownLabelForTesting", "Ignored"]]);
    const rebuilt = rebuild(source, replacements);

    expect(extract(rebuilt)).toStrictEqual(entries);
    expect(rebuilt.equals(source)).toBe(true);
  });
});
