/// <reference types="node" resolution-mode="require"/>
import { ByteOrder } from "@triforce-heroes/triforce-core";
import { MessageEncoding } from "../types/MessageEncoding.js";
export interface DataHeader {
    byteOrderMask: ByteOrder;
    messageEncoding: MessageEncoding;
    sectionsCount: number;
}
export declare function parseHeader(buffer: Buffer): DataHeader;
