import { BufferConsumer } from "@triforce-heroes/triforce-core";

import { DataHeader } from "./parseHeader.js";

export function parseSections(buffer: Buffer, header: DataHeader) {
  const consumer = new BufferConsumer(
    buffer.subarray(32),
    undefined,
    header.byteOrderMask,
  );

  const sections = new Map<string, Buffer>();

  while (!consumer.isConsumed()) {
    const kind = consumer.readString(4);
    const length = consumer.readUnsignedInt32();
    const lengthPad = 16 - (length % 16);

    consumer.skip(8); // Padding.
    sections.set(kind, consumer.read(length));
    consumer.skip(lengthPad); // Padding.
  }

  return sections;
}
