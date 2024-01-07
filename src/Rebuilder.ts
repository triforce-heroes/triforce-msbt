import { BufferBuilder } from "@triforce-heroes/triforce-core";

import { DataEntry } from "./types/DataEntry.js";

export function rebuild(entries: DataEntry[][]) {
  let textsIndex = 0;

  const textsOffsetsBuilder = new BufferBuilder();
  const textsMessagesBuilder = new BufferBuilder();

  const textsCount = entries.reduce((sum, entry) => sum + entry.length, 0);
  const textsOffset = 4 + textsCount * 4;

  const labelsOffsetsBuilder = new BufferBuilder();
  const labelsNamesBuilder = new BufferBuilder();

  const labelsNamesOffset = 4 + entries.length * 8;

  labelsOffsetsBuilder.writeUnsignedInt32(entries.length);

  for (const entry of entries) {
    labelsOffsetsBuilder.writeUnsignedInt32(entry.length);
    labelsOffsetsBuilder.writeUnsignedInt32(
      labelsNamesBuilder.length + labelsNamesOffset,
    );

    for (const message of entry) {
      textsOffsetsBuilder.writeUnsignedInt32(
        textsOffset + textsMessagesBuilder.length,
      );
      textsMessagesBuilder.push(Buffer.from(`${message[1]}\0`, "utf16le"));

      labelsNamesBuilder.writeLengthPrefixedString(message[0], 1);
      labelsNamesBuilder.writeUnsignedInt32(textsIndex++);
    }
  }

  const textsHeaderBuilder = new BufferBuilder();

  textsHeaderBuilder.writeString("TXT2"); // Magic.
  textsHeaderBuilder.writeUnsignedInt32(
    4 + textsOffsetsBuilder.length + textsMessagesBuilder.length,
  ); // Header length.
  textsHeaderBuilder.pad(16); // Padding.
  textsHeaderBuilder.writeUnsignedInt32(textsIndex); // Texts count.
  textsHeaderBuilder.push(
    textsOffsetsBuilder.build(),
    textsMessagesBuilder.build(),
  ); // Texts (offsets and messages).
  textsHeaderBuilder.pad(16, "\u00AB"); // Padding.

  const labelsHeaderBuilder = new BufferBuilder();

  labelsHeaderBuilder.writeString("LBL1"); // Magic.
  labelsHeaderBuilder.writeUnsignedInt32(
    labelsOffsetsBuilder.length + labelsNamesBuilder.length,
  ); // Header length.
  labelsHeaderBuilder.pad(16); // Padding.
  labelsHeaderBuilder.push(
    labelsOffsetsBuilder.build(),
    labelsNamesBuilder.build(),
  ); // Labels (offsets and names).
  labelsHeaderBuilder.pad(16, "\u00AB"); // Padding.

  const attributesHeaderBuilder = new BufferBuilder();

  attributesHeaderBuilder.writeString("ATR1"); // Magic.
  attributesHeaderBuilder.writeUnsignedInt32(8); // Header length.
  attributesHeaderBuilder.pad(16); // Padding.
  attributesHeaderBuilder.writeUnsignedInt32(textsIndex); // Texts count.
  attributesHeaderBuilder.writeUnsignedInt32(0); // Attribute length (always 0x00).
  attributesHeaderBuilder.pad(16, "\u00AB"); // Padding.

  const headerBuilder = new BufferBuilder();

  headerBuilder.writeString("MsgStdBn"); // Magic.
  headerBuilder.writeUnsignedInt16(0xfe_ff); // Byte order mask.
  headerBuilder.writeUnsignedInt16(0); // Unknown.
  headerBuilder.writeUnsignedInt8(1); // Encoding.
  headerBuilder.writeUnsignedInt8(3); // Version.
  headerBuilder.writeUnsignedInt16(3); // Sections count.
  headerBuilder.writeUnsignedInt16(0); // Unknown.
  headerBuilder.writeUnsignedInt32(
    32 +
      labelsHeaderBuilder.length +
      attributesHeaderBuilder.length +
      textsHeaderBuilder.length,
  ); // File size.
  headerBuilder.write(10); // Padding.

  headerBuilder.push(
    labelsHeaderBuilder.build(),
    attributesHeaderBuilder.build(),
    textsHeaderBuilder.build(),
  ); // Sections.

  return headerBuilder.build();
}
