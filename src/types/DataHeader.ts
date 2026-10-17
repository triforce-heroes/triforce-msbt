import type { ByteOrder } from "@triforce-heroes/triforce-core/types/ByteOrder";

import type { MessageEncoding } from "#/types/MessageEncoding";

export interface DataHeader {
  bom: ByteOrder;
  encoding: MessageEncoding;
  sections: number;
}
