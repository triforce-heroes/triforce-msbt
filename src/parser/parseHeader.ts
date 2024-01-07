import {
  BufferConsumer,
  ByteOrder,
  fatal,
} from "@triforce-heroes/triforce-core";

import { MessageEncoding } from "../types/MessageEncoding.js";

export interface DataHeader {
  byteOrderMask: ByteOrder;
  messageEncoding: MessageEncoding;
  sectionsCount: number;
}

export function parseHeader(buffer: Buffer): DataHeader {
  const consumer = new BufferConsumer(
    buffer,
    undefined,
    ByteOrder.LITTLE_ENDIAN,
  );

  const magic = consumer.readString(8);

  if (magic !== "MsgStdBn") {
    fatal("Not a MSBT file.");
  }

  const byteOrderMask =
    consumer.readUnsignedInt16() === 0xff_fe
      ? ByteOrder.BIG_ENDIAN
      : ByteOrder.LITTLE_ENDIAN;

  consumer.skip(2); // Unknown (always 0x00).

  const messageEncoding = consumer.readUnsignedInt8() as MessageEncoding;

  consumer.skip(); // Version number (always 0x03).

  const sectionsCount = consumer.readUnsignedInt16();

  consumer.skip(
    2 + // Unknown (always 0x00).
      4 + // File size.
      10, // Padding.
  );

  return { byteOrderMask, messageEncoding, sectionsCount };
}
