import type { DataHeader } from "../types/DataHeader";
export declare function parseSections(buffer: Buffer, header: DataHeader): Map<string, Buffer<ArrayBufferLike>>;
