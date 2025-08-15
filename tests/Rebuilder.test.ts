import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import type { DataEntry } from "@/index";

import { rebuild } from "@/index";

describe("rebuilder", () => {
  const samples: Array<[file: string, entries: DataEntry[]]> = [
    ["example0", []],
    ["example1", [["Hello", "Hello"]]],
    [
      "example2",
      [
        ["A", "123"],
        ["B", "456"],
      ],
    ],
    [
      "example3",
      [
        ["A", "\u0000\u00001"],
        ["B", "\u0000\u00002"],
      ],
    ],
    ["example4", [["Hello", "Ação!"]]],
    ["example5", [["npc_msg_00", "Hello"]]],
    ["example6", [["Hello", "ABC12345678"]]],
    ["example7", [["Hello", "ABC12345678"]]],
    ["example8", [["Hello", "Hello"]]],
  ] as const;

  it.each(samples)("rebuild(%s.msbt)", (file, entries) => {
    const buffer = readFileSync(`${__dirname}/fixtures/${file}.msbt`);

    expect(rebuild(entries, buffer)).toStrictEqual(buffer);
  });
});
