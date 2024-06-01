import { BufferConsumer } from "@triforce-heroes/triforce-core/BufferConsumer";
import { ByteOrder } from "@triforce-heroes/triforce-core/types/ByteOrder";

import { DataHeader } from "../types/DataHeader.js";

export function parseHeader(buffer: Buffer): DataHeader {
  const consumer = new BufferConsumer(
    buffer,
    undefined,
    ByteOrder.LITTLE_ENDIAN,
  );

  const bom =
    consumer
      .skip(8) // Magic (always "MsgStdBn").
      .readUnsignedInt16() === 0xff_fe
      ? ByteOrder.BIG_ENDIAN
      : ByteOrder.LITTLE_ENDIAN;

  const encoding = consumer
    .skip(2) // Unknown (always 0x00).
    .readUnsignedInt8();

  const sections = consumer
    .skip() // Version number (always 0x03).
    .readUnsignedInt32();

  consumer.skip(4); // File size.
  consumer.skip(10); // Padding.

  return { bom, encoding, sections };
}
