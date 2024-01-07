import { BufferBuilder } from "@triforce-heroes/triforce-core";

import { DataEntry } from "./types/DataEntry.js";

export function rebuild(entries: DataEntry[][]) {
  const texts = entries.flatMap((entry) =>
    [...entry].sort((a, b) => a[2] - b[2]).map((message) => message[1]),
  );

  const textsOffsetsBuilder = new BufferBuilder();
  const textsMessagesBuilder = new BufferBuilder();

  const textsOffset = 4 + texts.length * 4;

  for (const message of texts) {
    textsOffsetsBuilder.writeUnsignedInt32(
      textsOffset + textsMessagesBuilder.length,
    );
    textsMessagesBuilder.push(Buffer.from(`${message}\0`, "utf16le"));
  }

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
      labelsNamesBuilder.writeLengthPrefixedString(message[0], 1);
      labelsNamesBuilder.writeUnsignedInt32(message[2]);
    }
  }

  const textsHeaderBuilder = new BufferBuilder();

  textsHeaderBuilder.writeString("TXT2"); // Magic.
  textsHeaderBuilder.writeUnsignedInt32(
    4 + textsOffsetsBuilder.length + textsMessagesBuilder.length,
  ); // Header length.
  textsHeaderBuilder.pad(16); // Padding.
  textsHeaderBuilder.writeUnsignedInt32(texts.length); // Texts count.
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
  attributesHeaderBuilder.writeUnsignedInt32(texts.length); // Texts count.
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
