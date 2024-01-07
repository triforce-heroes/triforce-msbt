import { existsSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { rebuild } from "../src/Rebuilder.js";
import { DataEntry } from "../src/types/DataEntry.js";

describe("rebuilder", () => {
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
  ];

  it.each(samples)("rebuild(%s.msbt)", (file, entries) => {
    const path = `${__dirname}/fixtures`;
    const source = existsSync(`${path}/${file}b.msbt`)
      ? readFileSync(`${path}/${file}b.msbt`)
      : readFileSync(`${path}/${file}.msbt`);

    expect(rebuild(entries)).toStrictEqual(source);
  });
});
