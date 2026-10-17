import { ByteOrder } from "@triforce-heroes/triforce-core/types/ByteOrder";
import { describe, expect, it } from "vitest";

import { extract } from "#/Extract";
import { rebuild } from "#/Rebuilder";
import { MessageEncoding } from "#/types/MessageEncoding";
import { createMessageSource } from "#tests/utils/createMessageSource";

const unicodeMessage = "Olá, 世界! 🎮\nAção";
const unicodeBytes = "004f006c00e1002c00204e16754c00210020d83cdfae000a004100e700e3006f";

const byteOrders: Array<[name: string, byteOrder: ByteOrder]> = [
  ["big endian", ByteOrder.BIG_ENDIAN],
  ["little endian", ByteOrder.LITTLE_ENDIAN],
];

function orderedBytes(bigEndianHex: string, byteOrder: ByteOrder): Buffer {
  const buffer = Buffer.from(bigEndianHex, "hex");

  return byteOrder === ByteOrder.LITTLE_ENDIAN ? buffer.swap16() : buffer;
}

describe("UTF16 message encoding", () => {
  describe.each(byteOrders)("%s", (_byteOrderName, byteOrder) => {
    it("rejects a message with an odd byte length", () => {
      const source = createMessageSource(Buffer.from([0x41]), MessageEncoding.UTF16, byteOrder);

      expect(() => extract(source)).toThrow("Invalid UTF-16 message byte length.");
      expect(() => rebuild(source, new Map())).toThrow("Invalid UTF-16 message byte length.");
    });

    const samples: Array<[scenario: string, message: string, bigEndianHex: string]> = [
      ["Unicode text", unicodeMessage, unicodeBytes],
      ["empty text", "", ""],
      ["isolated high surrogate", "\uD800X", "d8000058"],
      ["isolated low surrogate", "X\uDC00", "0058dc00"],
      [
        "binary control markers",
        "A\u000E\u0002\u0004\u0002\u1DCDB\u000F\u0002\u0004",
        "0041000e0002000400021dcd0042000f00020004",
      ],
    ];

    it.each(samples)("extracts %s and preserves its bytes", (_, message, bigEndianHex) => {
      const source = createMessageSource(
        orderedBytes(bigEndianHex, byteOrder),
        MessageEncoding.UTF16,
        byteOrder,
      );
      const entries = extract(source);
      const rebuilt = rebuild(source, new Map(entries));

      expect(entries).toStrictEqual([["message", message]]);
      expect(rebuilt).toStrictEqual(source);
    });

    const replacements: Array<[scenario: string, message: string, bigEndianHex: string]> = [
      [
        "Unicode text",
        "Tradução: 日本語 🎮",
        "0054007200610064007500e700e3006f003a002065e5672c8a9e0020d83cdfae",
      ],
      ["empty text", "", ""],
    ];

    it.each(replacements)(
      "replaces with %s using the source byte order",
      (_, message, bigEndianHex) => {
        const source = createMessageSource(
          orderedBytes(unicodeBytes, byteOrder),
          MessageEncoding.UTF16,
          byteOrder,
        );
        const expected = createMessageSource(
          orderedBytes(bigEndianHex, byteOrder),
          MessageEncoding.UTF16,
          byteOrder,
        );
        const rebuilt = rebuild(source, new Map([["message", message]]));

        expect(rebuilt).toStrictEqual(expected);
        expect(extract(rebuilt)).toStrictEqual([["message", message]]);
      },
    );
  });
});

describe("UTF8 message encoding", () => {
  const samples: Array<[scenario: string, message: string, hex: string]> = [
    ["ASCII text", "Hello!\n", "48656c6c6f210a"],
    ["accented text", "Olá, ação!", "4f6cc3a12c2061c3a7c3a36f21"],
    ["invalid bytes", "A\uDCC0\uDCFF\uDC80B", "41c0ff8042"],
  ];

  it.each(samples)("preserves existing support for %s", (_, message, hex) => {
    const source = createMessageSource(
      Buffer.from(hex, "hex"),
      MessageEncoding.UTF8,
      ByteOrder.LITTLE_ENDIAN,
    );
    const entries = extract(source);
    const rebuilt = rebuild(source, new Map(entries));

    expect(entries).toStrictEqual([["message", message]]);
    expect(rebuilt).toStrictEqual(source);
  });
});
