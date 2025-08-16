import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import type { DataEntry } from "@/index";

import { transpile } from "@/index";

describe("transpile", () => {
  const samples: Array<[file: string, entries: DataEntry[]]> = [
    ["example0", []],
    ["example1", [["Hello", "Hello\0"]]],
    ["example1be", [["Hello", "Hello\0"]]],
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

  it.each(samples)("transpile(%s.msbt)", (file, entries) => {
    expect(
      transpile(readFileSync(`${__dirname}/fixtures/${file}.msbt`)),
    ).toStrictEqual(entries);
  });
});
