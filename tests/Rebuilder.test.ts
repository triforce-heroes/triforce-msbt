import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { rebuild } from "../src/Rebuilder.js";
import { DataEntry } from "../src/types/DataEntry.js";

describe("rebuilder", () => {
  const samples: Array<[file: string, slots: number, entries: DataEntry[]]> = [
    ["example0", 0, []],
    ["example1", 2, [["Hello", "Hello"]]],
    [
      "example2",
      1,
      [
        ["A", "123"],
        ["B", "456"],
      ],
    ],
    [
      "example3",
      1,
      [
        ["A", "\u0000\u00001"],
        ["B", "\u0000\u00002"],
      ],
    ],
    ["example4", 2, [["Hello", "Ação!"]]],
    ["example5", 101, [["npc_msg_00", "Hello"]]],
    ["example6", 2, [["Hello", "ABC12345678"]]],
  ];

  it.each(samples)("rebuild(%s.msbt)", (file, slots, entries) => {
    expect(rebuild(entries, slots)).toStrictEqual(
      readFileSync(`${__dirname}/fixtures/${file}.msbt`),
    );
  });
});
