import { BufferConsumer } from "@triforce-heroes/triforce-core/BufferConsumer";
import { ByteOrder } from "@triforce-heroes/triforce-core/types/ByteOrder";

import type { DataHeader } from "@/types/DataHeader";

export function parseHeader(buffer: Buffer): DataHeader {
  const bom =
    buffer.readUInt16LE(8) === 0xff_fe
      ? ByteOrder.BIG_ENDIAN
      : ByteOrder.LITTLE_ENDIAN;

  const consumer = new BufferConsumer(buffer, undefined, bom);

  consumer.skip(8); // Magic (always "MsgStdBn");
  consumer.skip(2); // Byte order mask.

  const encoding = consumer
    .skip(2) // Unknown (always 0x00).
    .readUnsignedInt8();

  const sections = consumer
    .skip() // Version number (always 0x03).
    .readUnsignedInt16();

  consumer.skip(2); // Unknown (always 0x0000).
  consumer.skip(4); // File size.
  consumer.skip(10); // Padding.

  return { bom, encoding, sections };
}
