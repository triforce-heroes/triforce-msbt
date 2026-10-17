import { BufferBuilder } from "@triforce-heroes/triforce-core/BufferBuilder";
import type { ByteOrder } from "@triforce-heroes/triforce-core/types/ByteOrder";

import { MessageEncoding } from "#/types/MessageEncoding";

function createSection(kind: string, content: Buffer, byteOrder: ByteOrder): Buffer {
  const builder = new BufferBuilder(byteOrder);

  builder.writeString(kind);
  builder.writeUnsignedInt32(content.length);
  builder.write(8);
  builder.push(content);
  builder.pad(16, "\u00AB");

  return builder.build();
}

export function createMessageSource(
  message: Buffer,
  encoding: MessageEncoding,
  byteOrder: ByteOrder,
): Buffer {
  const labelsBuilder = new BufferBuilder(byteOrder);

  labelsBuilder.writeUnsignedInt32(1);
  labelsBuilder.writeUnsignedInt32(1);
  labelsBuilder.writeUnsignedInt32(12);
  labelsBuilder.writeLengthPrefixedString("message", 1);
  labelsBuilder.writeUnsignedInt32(0);

  const textsBuilder = new BufferBuilder(byteOrder);

  textsBuilder.writeUnsignedInt32(1);
  textsBuilder.writeUnsignedInt32(8);
  textsBuilder.push(message, Buffer.alloc(encoding === MessageEncoding.UTF8 ? 1 : 2));

  const labelsSection = createSection("LBL1", labelsBuilder.build(), byteOrder);
  const textsSection = createSection("TXT2", textsBuilder.build(), byteOrder);
  const headerBuilder = new BufferBuilder(byteOrder);

  headerBuilder.writeString("MsgStdBn");
  headerBuilder.writeUnsignedInt16(0xfe_ff);
  headerBuilder.writeUnsignedInt16(0);
  headerBuilder.writeUnsignedInt8(encoding);
  headerBuilder.writeUnsignedInt8(3);
  headerBuilder.writeUnsignedInt16(2);
  headerBuilder.writeUnsignedInt16(0);
  headerBuilder.writeUnsignedInt32(32 + labelsSection.length + textsSection.length);
  headerBuilder.write(10);
  headerBuilder.push(labelsSection, textsSection);

  return headerBuilder.build();
}
