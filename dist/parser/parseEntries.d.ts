/// <reference types="node" resolution-mode="require"/>
import { DataEntry } from "../types/DataEntry.js";
import { DataHeader } from "./parseHeader.js";
export declare function parseEntries(header: DataHeader, sections: Map<string, Buffer>): DataEntry[];
