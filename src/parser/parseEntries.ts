import { BufferConsumer } from "@triforce-heroes/triforce-core";

import { DataEntry } from "../types/DataEntry.js";

import { DataHeader } from "./parseHeader.js";

export function parseEntries(
  header: DataHeader,
  sections: Map<string, Buffer>,
) {
  const { byteOrderMask: BOM } = header;

  const labelsData = sections.get("LBL1")!;
  const labelsConsumer = new BufferConsumer(labelsData, undefined, BOM);
  const labelsCount = labelsConsumer.readUnsignedInt32();

  const names = new Map<number, string>();
  const namesData = labelsData.subarray(4 + labelsCount * 8);
  const namesConsumer = new BufferConsumer(namesData, undefined, BOM);

  while (!namesConsumer.isConsumed()) {
    const name = namesConsumer.readLengthPrefixedString(1);
    const nameIndex = namesConsumer.readUnsignedInt32();

    names.set(nameIndex, name);
  }

  const textsData = sections.get("TXT2")!;
  const textsConsumer = new BufferConsumer(textsData, undefined, BOM);
  const textsCount = textsConsumer.readUnsignedInt32();

  const entries: DataEntry[] = [];

  for (let i = 0; i < textsCount; i++) {
    const offsetStarts = textsConsumer.readUnsignedInt32();
    const offsetEnds =
      i === textsCount - 1
        ? textsData.length - 2
        : textsConsumer.readUnsignedInt32() - 2;

    textsConsumer.back(4);

    const name = names.get(i)!;
    const text = textsData
      .subarray(offsetStarts, offsetEnds)
      .toString("utf16le");

    entries.push([name, text]);
  }

  return entries;
}
