import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import type { DataEntry } from "@/index";

import { transpile } from "@/index";

describe("transpile", () => {
  const samples: Array<[file: string, entries: DataEntry[]]> = [
    ["example0", []],
    ["example1", [["Hello", "Hello"]]],
    ["example1be", [["Hello", "Hello"]]],
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
  ] as const;

  it.each(samples)("transpile(%s.msbt)", (file, entries) => {
    expect(
      transpile(readFileSync(`${__dirname}/fixtures/${file}.msbt`)),
    ).toStrictEqual(entries);
  });
});
