import { readFileSync } from "node:fs";

import * as core from "@triforce-heroes/triforce-core";
import { describe, expect, it, vi } from "vitest";

import { transpile } from "../src/Transpile.js";
import { DataEntry } from "../src/types/DataEntry.js";

describe("transpile", () => {
  const samples: Array<[string, DataEntry[][]]> = [
    ["example", [[]]],
    ["example2", [[], [["Hello", "Hello"]]]],
    ["example3", []],
    [
      "example4",
      [
        [
          ["A", "123"],
          ["B", "456"],
        ],
      ],
    ],
    [
      "example5",
      [
        [
          ["A", "123"],
          ["B", "456"],
        ],
      ],
    ],
    [
      "example6",
      [
        [
          ["A", "\u0000\u00001"],
          ["B", "\u0000\u00002"],
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
        [["xxxxxxxxxx", "Hello"]],
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
