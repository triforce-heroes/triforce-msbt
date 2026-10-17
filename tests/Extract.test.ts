import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { extract } from "#/Extract";

describe(extract, () => {
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

  it.each(samples)("extract(%s.msbt)", async (file, entries) => {
    expect.assertions(1);

    const buffer = await readFile(new URL(`fixtures/${file}.msbt`, import.meta.url));

    expect(extract(buffer)).toStrictEqual(entries);
  });
});
