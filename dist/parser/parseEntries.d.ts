import type { DataEntry } from "../types/DataEntry";
import type { DataHeader } from "../types/DataHeader";
export declare function parseEntries(header: DataHeader, sections: Map<string, Buffer>): DataEntry[];
