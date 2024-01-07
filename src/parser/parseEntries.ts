import { BufferConsumer } from "@triforce-heroes/triforce-core";

import { DataEntry } from "../types/DataEntry.js";

import { DataHeader } from "./parseHeader.js";

export function parseEntries(
  header: DataHeader,
  sections: Map<string, Buffer>,
) {
  const entries: DataEntry[][] = [];

  const textsData = sections.get("TXT2")!;
  const textsOffsetsConsumer = new BufferConsumer(
    textsData,
    undefined,
    header.byteOrderMask,
  );
  const textsOffsets = textsOffsetsConsumer.readUnsignedInt32();

  const textsEntries: string[] = [];

  for (let i = 0; i < textsOffsets; i++) {
    const textOffsetStarts = textsOffsetsConsumer.readUnsignedInt32();
    const testOffsetEnds =
      i === textsOffsets - 1
        ? textsData.length - 2
        : textsOffsetsConsumer.readUnsignedInt32() - 2;

    textsOffsetsConsumer.back(4);

    textsEntries.push(
      textsData.subarray(textOffsetStarts, testOffsetEnds).toString("utf16le"),
    );
  }

  const labelsData = sections.get("LBL1")!;
  const labelsConsumer = new BufferConsumer(
    labelsData,
    undefined,
    header.byteOrderMask,
  );
  const labelsCount = labelsConsumer.readUnsignedInt32();

  const namesOffset = 4 + labelsCount * 8;
  const namesConsumer = new BufferConsumer(
    labelsData.subarray(namesOffset),
    undefined,
    header.byteOrderMask,
  );

  for (let i = 0; i < labelsCount; i++) {
    const entryLength = labelsConsumer.readUnsignedInt32();

    if (entryLength === 0) {
      labelsConsumer.skip(4);

      entries.push([]);

      continue;
    }

    const entryOffset = labelsConsumer.readUnsignedInt32();

    namesConsumer.seek(entryOffset - namesOffset);

    const entryLabels: DataEntry[] = [];

    for (let j = 0; j < entryLength; j++) {
      const entryName = namesConsumer.readLengthPrefixedString(1);
      const entryTextIndex = namesConsumer.readUnsignedInt32();

      entryLabels.push([entryName, textsEntries[entryTextIndex]!]);
    }

    entries.push(entryLabels);
  }

  return entries;
}
