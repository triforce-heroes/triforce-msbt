/// <reference types="node" resolution-mode="require"/>
import { DataHeader } from "../types/DataHeader.js";
export declare function parseSections(buffer: Buffer, header: DataHeader): Map<string, Buffer>;
