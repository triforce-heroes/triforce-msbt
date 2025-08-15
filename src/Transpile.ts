import { parseEntries } from "@/parser/parseEntries";
import { parseHeader } from "@/parser/parseHeader";
import { parseSections } from "@/parser/parseSections";

export function transpile(buffer: Buffer) {
  const header = parseHeader(buffer);
  const sections = parseSections(buffer, header);

  return parseEntries(header, sections);
}
