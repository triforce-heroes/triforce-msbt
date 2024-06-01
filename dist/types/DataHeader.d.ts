import { ByteOrder } from "@triforce-heroes/triforce-core/types/ByteOrder";
import { MessageEncoding } from "./MessageEncoding.js";
export interface DataHeader {
    bom: ByteOrder;
    encoding: MessageEncoding;
    sections: number;
}
