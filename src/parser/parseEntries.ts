import { BufferConsumer } from "@triforce-heroes/triforce-core/BufferConsumer";

import type { DataEntry } from "@/types/DataEntry";
import type { DataHeader } from "@/types/DataHeader";

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

  for (let i = 0; i < textsCount; i++) {
    const offsetStarts = textsConsumer.readUnsignedInt32();
    const offsetEnds =
      i === textsCount - 1
        ? textsData.length
        : textsConsumer.readUnsignedInt32();

    textsConsumer.back(4);

    entries.push([
      names.get(i)!,
      textsData.subarray(offsetStarts, offsetEnds).toString("binary"),
    ]);
  }

  return entries;
}
