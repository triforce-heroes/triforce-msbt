import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import type { DataEntry } from "@/index";

import { rebuild } from "@/index";

describe("rebuilder", () => {
  const samples: Array<[file: string, entries: DataEntry[]]> = [
    ["example0", []],
    ["example1", [["Hello", "H\x00e\x00l\x00l\x00o\x00"]]],
    ["example1be", [["Hello", "\x00H\x00e\x00l\x00l\x00o"]]],
    [
      "example2",
      [
        ["A", "1\x002\x003\x00"],
        ["B", "4\x005\x006\x00"],
      ],
    ],
    [
      "example3",
      [
        ["A", "\x00\x00\x00\x001\x00"],
        ["B", "\x00\x00\x00\x002\x00"],
      ],
    ],
    ["example4", [["Hello", "A\x00ç\x00ã\x00o\x00!\x00"]]],
    ["example5", [["npc_msg_00", "H\x00e\x00l\x00l\x00o\x00"]]],
    [
      "example6",
      [["Hello", "A\x00B\x00C\x001\x002\x003\x004\x005\x006\x007\x008\x00"]],
    ],
    [
      "example7",
      [["Hello", "A\x00B\x00C\x001\x002\x003\x004\x005\x006\x007\x008\x00"]],
    ],
    ["example8", [["Hello", "Hello"]]],
    ["example9", [["Hello", "\u00CF\u00FF\u00FF\u004Do"]]],
  ] as const;

  it.each(samples)("rebuild(%s.msbt)", (file, entries) => {
    const buffer = readFileSync(`${__dirname}/fixtures/${file}.msbt`);

    expect(rebuild(entries, buffer)).toStrictEqual(buffer);
  });
});
