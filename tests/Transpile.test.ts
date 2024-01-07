import { readFileSync } from "node:fs";

import * as core from "@triforce-heroes/triforce-core";
import { describe, expect, it, vi } from "vitest";

import { transpile } from "../src/Transpile.js";
import { DataEntry } from "../src/types/DataEntry.js";

describe("transpile", () => {
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
  ] as const;

  it.each(samples)("transpile(%s.msbt)", (file, entries) => {
    expect(
      transpile(readFileSync(`${__dirname}/fixtures/${file}.msbt`)),
    ).toStrictEqual(entries);
  });

  it("transpile(invalid.msbt) must thrown Error", () => {
    expect.assertions(1);

    vi.spyOn(core, "fatal").mockImplementationOnce(() => {
      throw new Error("ERROR");
    });

    expect(() =>
      transpile(readFileSync(`${__dirname}/fixtures/invalid.msbt`)),
    ).toThrow("ERROR");
  });
});
