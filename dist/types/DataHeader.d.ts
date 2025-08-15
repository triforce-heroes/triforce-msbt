import type { MessageEncoding } from "./MessageEncoding";
import type { ByteOrder } from "@triforce-heroes/triforce-core/types/ByteOrder";
export interface DataHeader {
    bom: ByteOrder;
    encoding: MessageEncoding;
    sections: number;
}
