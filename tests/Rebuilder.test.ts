import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { parseEntries } from "#/parser/parseEntries";
import { parseHeader } from "#/parser/parseHeader";
import { parseSections } from "#/parser/parseSections";
import { rebuild } from "#/Rebuilder";

describe("rebuilder", () => {
  const samples: Array<[file: string, entries: Array<[label: string, message: string]>]> = [
    ["example0", []],
    ["example1", [["Hello", "H\u0000e\u0000l\u0000l\u0000o\u0000"]]],
    ["example1be", [["Hello", "\u0000H\u0000e\u0000l\u0000l\u0000o"]]],
    [
      "example2",
      [
        ["A", "1\u00002\u00003\u0000"],
        ["B", "4\u00005\u00006\u0000"],
      ],
    ],
    [
      "example3",
      [
        ["A", "\u0000\u0000\u0000\u00001\u0000"],
        ["B", "\u0000\u0000\u0000\u00002\u0000"],
      ],
    ],
    ["example4", [["Hello", "A\u0000ç\u0000ã\u0000o\u0000!\u0000"]]],
    ["example5", [["npc_msg_00", "H\u0000e\u0000l\u0000l\u0000o\u0000"]]],
    [
      "example6",
      [["Hello", "A\u0000B\u0000C\u00001\u00002\u00003\u00004\u00005\u00006\u00007\u00008\u0000"]],
    ],
    [
      "example7",
      [["Hello", "A\u0000B\u0000C\u00001\u00002\u00003\u00004\u00005\u00006\u00007\u00008\u0000"]],
    ],
    ["example8", [["Hello", "Hello"]]],
    ["example9", [["Hello", "\uDCCF\uDCFF\uDCFF\u004Do"]]],
  ] as const;

  it.each(samples)("rebuild(%s.msbt)", async (file, entries) => {
    expect.assertions(1);

    const buffer = await readFile(new URL(`fixtures/${file}.msbt`, import.meta.url));

    expect(rebuild(buffer, new Map(entries))).toStrictEqual(buffer);
  });

  it.each(samples)("preserves %s.msbt with no replacements", async (file) => {
    expect.assertions(1);

    const source = await readFile(new URL(`fixtures/${file}.msbt`, import.meta.url));

    expect(rebuild(source, new Map())).toStrictEqual(source);
  });

  const replacementsSamples: Array<
    [
      scenario: string,
      file: string,
      replacements: Map<string, string>,
      expected: Array<[label: string, message: string]>,
    ]
  > = [
    [
      "replaces only a matching label",
      "example2",
      new Map([["B", "O\u0000i\u0000"]]),
      [
        ["A", "1\u00002\u00003\u0000"],
        ["B", "O\u0000i\u0000"],
      ],
    ],
    [
      "preserves source order when replacements are reversed",
      "example2",
      new Map([
        ["B", "B\u0000"],
        ["A", "A\u0000"],
      ]),
      [
        ["A", "A\u0000"],
        ["B", "B\u0000"],
      ],
    ],
    [
      "accepts an empty replacement",
      "example2",
      new Map([["A", ""]]),
      [
        ["A", ""],
        ["B", "4\u00005\u00006\u0000"],
      ],
    ],
    [
      "ignores labels absent from the source",
      "example2",
      new Map([["Unknown", "Ignored"]]),
      [
        ["A", "1\u00002\u00003\u0000"],
        ["B", "4\u00005\u00006\u0000"],
      ],
    ],
    ["replaces UTF-8 text", "example8", new Map([["Hello", "Ação!"]]), [["Hello", "Ação!"]]],
    [
      "replaces big-endian text",
      "example1be",
      new Map([["Hello", "\u0000O\u0000i"]]),
      [["Hello", "\u0000O\u0000i"]],
    ],
  ];

  it.each(replacementsSamples)("%s", async (_, file, replacements, expected) => {
    expect.assertions(3);

    const source = await readFile(new URL(`fixtures/${file}.msbt`, import.meta.url));
    const originalSource = Buffer.from(source);
    const originalReplacements = new Map(replacements);
    const rebuilt = rebuild(source, replacements);
    const header = parseHeader(rebuilt);
    const sections = parseSections(rebuilt, header);

    expect(parseEntries(header, sections)).toStrictEqual(expected);
    expect(source).toStrictEqual(originalSource);
    expect(replacements).toStrictEqual(originalReplacements);
  });
});
