import { BufferBuilder } from "@triforce-heroes/triforce-core/BufferBuilder";
import { encodeFromString, encodeString } from "@triforce-heroes/triforce-core/Encoding";
import { ByteOrder } from "@triforce-heroes/triforce-core/types/ByteOrder";

import { parseEntries } from "#/parser/parseEntries";
import { parseHeader } from "#/parser/parseHeader";
import { parseSections } from "#/parser/parseSections";
import type { DataHeader } from "#/types/DataHeader";
import { MessageEncoding } from "#/types/MessageEncoding";
import { hash } from "#/utils/hash";

type DataLabel = [identifier: string, index: number];

function encodeMessage(message: string, header: DataHeader): Buffer {
  if (header.encoding === MessageEncoding.UTF8) {
    return encodeFromString(`${message}\0`);
  }

  if (header.encoding !== MessageEncoding.UTF16) {
    return Buffer.from(`${message}\0\0`, "binary");
  }

  const messageBytes = encodeString(`${message}\0`, "utf16-le");

  return header.bom === ByteOrder.BIG_ENDIAN ? messageBytes.swap16() : messageBytes;
}

function rebuildHeader(sections: Buffer[], header: DataHeader) {
  const builder = new BufferBuilder(header.bom);

  let sectionsLength = 32;

  for (const section of sections) {
    sectionsLength += section.length;
  }

  builder.writeString("MsgStdBn");
  builder.writeUnsignedInt16(0xfe_ff);
  builder.writeUnsignedInt16(0);
  builder.writeUnsignedInt8(header.encoding);
  builder.writeUnsignedInt8(3);
  builder.writeUnsignedInt16(sections.length);
  builder.writeUnsignedInt16(0);
  builder.writeUnsignedInt32(sectionsLength);
  builder.write(10);
  builder.push(...sections);

  return builder.build();
}

function rebuildSection(kind: string, buffer: Buffer, header: DataHeader) {
  const builder = new BufferBuilder(header.bom);

  builder.writeString(kind);
  builder.writeUnsignedInt32(buffer.length);
  builder.pad(16);
  builder.push(buffer);
  builder.pad(16, "\u00AB");

  return builder.build();
}

function rebuildTexts(entryCount: number, offsets: Buffer, messages: Buffer, header: DataHeader) {
  const builder = new BufferBuilder(header.bom);

  builder.writeString("TXT2");
  builder.writeUnsignedInt32(4 + offsets.length + messages.length);
  builder.pad(16);
  builder.writeUnsignedInt32(entryCount);
  builder.push(offsets, messages);
  builder.pad(16, "\u00AB");

  return builder.build();
}

export function rebuild(source: Buffer, replacements: Map<string, string>): Buffer {
  const sourceHeader = parseHeader(source);
  const sourceSections = parseSections(source, sourceHeader);
  const entries = parseEntries(sourceHeader, sourceSections);

  let labelsSlots = 0;

  for (const [section, sectionBuffer] of sourceSections.entries()) {
    if (section === "LBL1") {
      labelsSlots =
        sourceHeader.bom === ByteOrder.BIG_ENDIAN
          ? sectionBuffer.readUInt32BE()
          : sectionBuffer.readUInt32LE();
    }
  }

  const labels = new Map<number, DataLabel[]>(
    Array.from({ length: labelsSlots }, (_, i) => [i, []]),
  );

  const textsOffsetsBuilder = new BufferBuilder(sourceHeader.bom);
  const textsMessagesBuilder = new BufferBuilder(sourceHeader.bom);
  const textsMessagesOffset = 4 + entries.length * 4;

  for (const [entryIndex, entry] of entries.entries()) {
    const [label, sourceMessage] = entry;
    const message = replacements.get(label) ?? sourceMessage;
    const textMessageOffset = textsMessagesOffset + textsMessagesBuilder.length;

    textsOffsetsBuilder.writeUnsignedInt32(textMessageOffset);
    textsMessagesBuilder.push(encodeMessage(message, sourceHeader));

    labels.get(hash(label, labelsSlots))!.push([label, entryIndex]);
  }

  const labelsOffsetsBuilder = new BufferBuilder(sourceHeader.bom);

  const labelsNamesBuilder = new BufferBuilder(sourceHeader.bom);
  const labelsNamesOffset = 4 + labelsSlots * 8;

  labelsOffsetsBuilder.writeUnsignedInt32(labelsSlots);

  for (const names of labels.values()) {
    labelsOffsetsBuilder.writeUnsignedInt32(names.length);
    labelsOffsetsBuilder.writeUnsignedInt32(labelsNamesOffset + labelsNamesBuilder.length);

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
          Buffer.concat([labelsOffsetsBuilder.build(), labelsNamesBuilder.build()]),
          sourceHeader,
        ),
      );
    } else if (kind === "TXT2") {
      sections.push(
        rebuildTexts(
          entries.length,
          textsOffsetsBuilder.build(),
          textsMessagesBuilder.build(),
          sourceHeader,
        ),
      );
    } else {
      sections.push(rebuildSection(kind, section, sourceHeader));
    }
  }

  return rebuildHeader(sections, sourceHeader);
}
