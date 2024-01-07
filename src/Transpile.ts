import { parseEntries } from "./parser/parseEntries.js";
import { parseHeader } from "./parser/parseHeader.js";
import { parseSections } from "./parser/parseSections.js";

export function transpile(buffer: Buffer) {
  const header = parseHeader(buffer);
  const sections = parseSections(buffer, header);

  return parseEntries(header, sections);
}
