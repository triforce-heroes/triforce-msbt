import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import type { DataEntry } from "@/index";

import { rebuild } from "@/index";

describe("rebuilder", () => {
  const samples: Array<[file: string, entries: DataEntry[]]> = [
    ["example0", []],
    ["example1", [["Hello", "Hello\0"]]],
    [
      "example2",
      [
        ["A", "123\0"],
        ["B", "456\0"],
      ],
    ],
    [
      "example3",
      [
        ["A", "\u0000\u00001\0"],
        ["B", "\u0000\u00002\0"],
      ],
    ],
    ["example4", [["Hello", "Ação!\0"]]],
    ["example5", [["npc_msg_00", "Hello\0"]]],
    ["example6", [["Hello", "ABC12345678\0"]]],
    ["example7", [["Hello", "ABC12345678\0"]]],
    ["example8", [["Hello", "Hello\0"]]],
  ] as const;

  it.each(samples)("rebuild(%s.msbt)", (file, entries) => {
    const buffer = readFileSync(`${__dirname}/fixtures/${file}.msbt`);

    expect(rebuild(entries, buffer)).toStrictEqual(buffer);
  });
});
