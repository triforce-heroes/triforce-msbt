import { describe, expect, it } from "vitest";

import { hash } from "@/utils/hash";

describe("hash", () => {
  const samples = [
    ["hello", 65],
    ["savedata", 36],
    ["remove", 36],
    ["npc_msg_00", 77],
  ] as const;

  it.each(samples)("hash(%j)", (input, position) => {
    expect(hash(input, 101)).toStrictEqual(position);
  });
});
