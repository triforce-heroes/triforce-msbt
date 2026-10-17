import { BufferConsumer } from "@triforce-heroes/triforce-core/BufferConsumer";
import { decodeBuffer, encodeToString } from "@triforce-heroes/triforce-core/Encoding";
import { ByteOrder } from "@triforce-heroes/triforce-core/types/ByteOrder";

import type { DataHeader } from "#/types/DataHeader";
import { MessageEncoding } from "#/types/MessageEncoding";

type DataEntry = [label: string, message: string];

function decodeMessage(source: Buffer, header: DataHeader): string {
  if (header.encoding === MessageEncoding.UTF8) {
    return encodeToString(source.subarray(0, -1));
  }

  const message = source.subarray(0, -2);

  if (header.encoding !== MessageEncoding.UTF16) {
    return message.toString("binary");
  }

  if (message.length % 2 !== 0) {
    throw new Error("Invalid UTF-16 message byte length.");
  }

  // Swap a copy to avoid changing the original file or binary control codes.
  const littleEndianMessage =
    header.bom === ByteOrder.BIG_ENDIAN ? Buffer.from(message).swap16() : message;

  return decodeBuffer(littleEndianMessage, "utf16-le");
}

export function parseEntries(header: DataHeader, sections: Map<string, Buffer>): DataEntry[] {
  const labelsData = sections.get("LBL1")!;
  const labelsConsumer = new BufferConsumer(labelsData, undefined, header.bom);
  const labelsCount = labelsConsumer.readUnsignedInt32();

  const names = new Map<number, string>();
  const namesData = labelsData.subarray(4 + labelsCount * 8);
  const namesConsumer = new BufferConsumer(namesData, undefined, header.bom);

  while (!namesConsumer.isConsumed()) {
    const name = namesConsumer.readLengthPrefixedString(1);
    const nameIndex = namesConsumer.readUnsignedInt32();

    names.set(nameIndex, name);
  }

  const textsData = sections.get("TXT2")!;
  const textsConsumer = new BufferConsumer(textsData, undefined, header.bom);
  const textsCount = textsConsumer.readUnsignedInt32();

  const entries: DataEntry[] = [];

  for (let i = 0; i < textsCount; i++) {
    const offsetStarts = textsConsumer.readUnsignedInt32();
    const offsetEnds = i === textsCount - 1 ? textsData.length : textsConsumer.readUnsignedInt32();

    textsConsumer.back(4);

    entries.push([
      names.get(i)!,
      decodeMessage(textsData.subarray(offsetStarts, offsetEnds), header),
    ]);
  }

  return entries;
}
