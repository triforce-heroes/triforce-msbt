import { DataEntry } from "../types/DataEntry.js";
import { DataHeader } from "../types/DataHeader.js";
export declare function parseEntries(header: DataHeader, sections: Map<string, Buffer>): DataEntry[];
