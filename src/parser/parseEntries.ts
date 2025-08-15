import { BufferConsumer } from "@triforce-heroes/triforce-core/BufferConsumer";
import { ByteOrder } from "@triforce-heroes/triforce-core/types/ByteOrder";
import iconv from "iconv-lite";

import type { DataEntry } from "@/types/DataEntry";
import type { DataHeader } from "@/types/DataHeader";

import { MessageEncoding } from "@/types/MessageEncoding";

export function parseEntries(
  header: DataHeader,
  sections: Map<string, Buffer>,
) {
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

  const isUTF8 = header.encoding === MessageEncoding.UTF8;

  for (let i = 0; i < textsCount; i++) {
    const offsetStarts = textsConsumer.readUnsignedInt32();
    const offsetEnds =
      i === textsCount - 1
        ? textsData.length
        : textsConsumer.readUnsignedInt32();

    textsConsumer.back(4);

    const name = names.get(i)!;

    const text = textsData.subarray(offsetStarts, offsetEnds);
    const textString =
      header.bom === ByteOrder.BIG_ENDIAN
        ? iconv.decode(text, "utf16be")
        : text.toString(isUTF8 ? "utf8" : "utf16le");

    entries.push([name, textString.slice(0, -1)]);
  }

  return entries;
}
