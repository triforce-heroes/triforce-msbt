import { BufferBuilder } from "@triforce-heroes/triforce-core/BufferBuilder";

import { DataEntry } from "./types/DataEntry.js";
import { MessageEncoding } from "./types/MessageEncoding.js";
import { hash } from "./utils/hash.js";

type DataLabel = [identifier: string, index: number];

function rebuildHeader(labels: Buffer, attributes: Buffer, texts: Buffer) {
  const builder = new BufferBuilder();

  builder.writeString("MsgStdBn");
  builder.writeUnsignedInt16(0xfe_ff);
  builder.writeUnsignedInt16(0);
  builder.writeUnsignedInt8(MessageEncoding.UTF16);
  builder.writeUnsignedInt8(3);
  builder.writeUnsignedInt16(3);
  builder.writeUnsignedInt16(0);
  builder.writeUnsignedInt32(
    32 + labels.length + attributes.length + texts.length,
  );
  builder.write(10);
  builder.push(labels, attributes, texts);

  return builder.build();
}

function rebuildLabels(offsets: Buffer, names: Buffer) {
  const builder = new BufferBuilder();

  builder.writeString("LBL1");
  builder.writeUnsignedInt32(offsets.length + names.length);
  builder.pad(16);
  builder.push(offsets, names);
  builder.pad(16, "\u00AB");

  return builder.build();
}

function rebuildAttributes(entries: DataEntry[]) {
  const builder = new BufferBuilder();

  builder.writeString("ATR1");
  builder.writeUnsignedInt32(8);
  builder.pad(16);
  builder.writeUnsignedInt32(entries.length);
  builder.writeUnsignedInt32(0);
  builder.pad(16, "\u00AB");

  return builder.build();
}

function rebuildTexts(entries: DataEntry[], offsets: Buffer, messages: Buffer) {
  const builder = new BufferBuilder();

  builder.writeString("TXT2");
  builder.writeUnsignedInt32(4 + offsets.length + messages.length);
  builder.pad(16);
  builder.writeUnsignedInt32(entries.length);
  builder.push(offsets, messages);
  builder.pad(16, "\u00AB");

  return builder.build();
}

export function rebuild(entries: DataEntry[], slots = 101) {
  const labels = new Map<number, DataLabel[]>(
    Array.from({ length: slots }, (_, i) => [i, []]),
  );

  const textsOffsetsBuilder = new BufferBuilder();
  const textsMessagesBuilder = new BufferBuilder();
  const textsMessagesOffset = 4 + entries.length * 4;

  for (const [entryIndex, entry] of entries.entries()) {
    const textMessageOffset = textsMessagesOffset + textsMessagesBuilder.length;

    textsOffsetsBuilder.writeUnsignedInt32(textMessageOffset);
    textsMessagesBuilder.push(Buffer.from(`${entry[1]}\0`, "utf16le"));

    labels.get(hash(entry[0], slots))!.push([entry[0], entryIndex]);
  }

  const labelsOffsetsBuilder = new BufferBuilder();

  const labelsNamesBuilder = new BufferBuilder();
  const labelsNamesOffset = 4 + slots * 8;

  labelsOffsetsBuilder.writeUnsignedInt32(slots);

  for (const names of labels.values()) {
    labelsOffsetsBuilder.writeUnsignedInt32(names.length);
    labelsOffsetsBuilder.writeUnsignedInt32(
      labelsNamesOffset + labelsNamesBuilder.length,
    );

    for (const [name, nameIndex] of names) {
      labelsNamesBuilder.writeLengthPrefixedString(name, 1);
      labelsNamesBuilder.writeUnsignedInt32(nameIndex);
    }
  }

  return rebuildHeader(
    rebuildLabels(labelsOffsetsBuilder.build(), labelsNamesBuilder.build()),
    rebuildAttributes(entries),
    rebuildTexts(
      entries,
      textsOffsetsBuilder.build(),
      textsMessagesBuilder.build(),
    ),
  );
}
