import { parseEntries } from "#/parser/parseEntries";
import { parseHeader } from "#/parser/parseHeader";
import { parseSections } from "#/parser/parseSections";

export function extract(source: Buffer): Array<[label: string, message: string]> {
  const header = parseHeader(source);
  const sections = parseSections(source, header);

  return parseEntries(header, sections);
}
