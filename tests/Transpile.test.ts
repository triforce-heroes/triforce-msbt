import { readFileSync } from "node:fs";

import * as core from "@triforce-heroes/triforce-core";
import { describe, expect, it, vi } from "vitest";

import { transpile } from "../src/Transpile.js";
import { DataEntry } from "../src/types/DataEntry.js";

describe("transpile", () => {
  const samples: Array<[string, DataEntry[][]]> = [
    ["example", [[]]],
    ["example2", [[], [["Hello", "Hello", 0]]]],
    ["example3", []],
    [
      "example4",
      [
        [
          ["A", "123", 0],
          ["B", "456", 1],
        ],
      ],
    ],
    [
      "example5",
      [
        [
          ["A", "123", 1],
          ["B", "456", 0],
        ],
      ],
    ],
    [
      "example9",
      [
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [["xxxxxxxxxx", "Hello", 0]],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
      ],
    ],
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
