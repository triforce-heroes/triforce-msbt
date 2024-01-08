/// <reference types="node" resolution-mode="require"/>
import { DataHeader } from "./parseHeader.js";
export declare function parseSections(buffer: Buffer, header: DataHeader): Map<string, Buffer>;
