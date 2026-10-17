//#region src/Transpile.d.ts
export declare function transpile(buffer: Buffer): DataEntry[];
//#endregion
//#region src/types/DataEntry.d.ts
type DataEntry = [label: string, message: string];
//#endregion
//#region src/Rebuilder.d.ts
export declare function rebuild(entries: DataEntry[], source: Buffer): Buffer<ArrayBuffer>;
//#endregion
export type { DataEntry };