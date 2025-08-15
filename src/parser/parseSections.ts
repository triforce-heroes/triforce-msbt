import { BufferConsumer } from "@triforce-heroes/triforce-core/BufferConsumer";

import type { DataHeader } from "@/types/DataHeader";

export function parseSections(buffer: Buffer, header: DataHeader) {
  const consumer = new BufferConsumer(buffer, 32, header.bom);
  const sections = new Map<string, Buffer>();

  while (!consumer.isConsumed()) {
    const kind = consumer.readString(4);
    const length = consumer.readUnsignedInt32();

    consumer.skip(8); // Padding.
    sections.set(kind, consumer.read(length));
    consumer.skipPadding(16);
  }

  return sections;
}
