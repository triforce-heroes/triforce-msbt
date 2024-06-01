import { BufferBuilder } from "@triforce-heroes/triforce-core/BufferBuilder";

import { parseHeader } from "./parser/parseHeader.js";
import { parseSections } from "./parser/parseSections.js";
import { DataEntry } from "./types/DataEntry.js";
import { MessageEncoding } from "./types/MessageEncoding.js";
import { hash } from "./utils/hash.js";

type DataLabel = [identifier: string, index: number];

function rebuildHeader(sections: Buffer[]) {
  const builder = new BufferBuilder();

  let sectionsLength = 32;

  for (const section of sections) {
    sectionsLength += section.length;
  }

  builder.writeString("MsgStdBn");
  builder.writeUnsignedInt16(0xfe_ff);
  builder.writeUnsignedInt16(0);
  builder.writeUnsignedInt8(MessageEncoding.UTF16);
  builder.writeUnsignedInt8(3);
  builder.writeUnsignedInt16(sections.length);
  builder.writeUnsignedInt16(0);
  builder.writeUnsignedInt32(sectionsLength);
  builder.write(10);
  builder.push(...sections);

  return builder.build();
}

function rebuildSection(kind: string, buffer: Buffer) {
  const builder = new BufferBuilder();

  builder.writeString(kind);
  builder.writeUnsignedInt32(buffer.length);
  builder.pad(16);
  builder.push(buffer);
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

export function rebuild(entries: DataEntry[], source: Buffer) {
  const sourceHeader = parseHeader(source);
  const sourceSections = parseSections(source, sourceHeader);

  let labelsSlots!: number;

  for (const [section, sectionBuffer] of sourceSections.entries()) {
    if (section === "LBL1") {
      labelsSlots = sectionBuffer.readUInt32LE();
    }
  }

  const labels = new Map<number, DataLabel[]>(
    Array.from({ length: labelsSlots }, (_, i) => [i, []]),
  );

  const textsOffsetsBuilder = new BufferBuilder();
  const textsMessagesBuilder = new BufferBuilder();
  const textsMessagesOffset = 4 + entries.length * 4;

  for (const [entryIndex, entry] of entries.entries()) {
    const textMessageOffset = textsMessagesOffset + textsMessagesBuilder.length;

    textsOffsetsBuilder.writeUnsignedInt32(textMessageOffset);
    textsMessagesBuilder.push(Buffer.from(`${entry[1]}\0`, "utf16le"));

    labels.get(hash(entry[0], labelsSlots))!.push([entry[0], entryIndex]);
  }

  const labelsOffsetsBuilder = new BufferBuilder();

  const labelsNamesBuilder = new BufferBuilder();
  const labelsNamesOffset = 4 + labelsSlots * 8;

  labelsOffsetsBuilder.writeUnsignedInt32(labelsSlots);

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

  const sections: Buffer[] = [];

  for (const [kind, section] of sourceSections) {
    if (kind === "LBL1") {
      sections.push(
        rebuildSection(
          kind,
          Buffer.concat([
            labelsOffsetsBuilder.build(),
            labelsNamesBuilder.build(),
          ]),
        ),
      );
    } else if (kind === "TXT2") {
      sections.push(
        rebuildTexts(
          entries,
          textsOffsetsBuilder.build(),
          textsMessagesBuilder.build(),
        ),
      );
    } else {
      sections.push(rebuildSection(kind, section));
    }
  }

  return rebuildHeader(sections);
}
