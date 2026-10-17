import { readdir, readFile } from "node:fs/promises";
import { join, sep } from "node:path";

import { Publisher } from "@triforce-heroes/triforce-publisher";

import { extract } from "#/Extract";

const publisher = new Publisher(14);

const languages = new Map<string, string>([
  ["de_DE", "de"],
  ["en_GB", "en-EU"],
  ["en_US", "en"],
  ["es_ES", "es-EU"],
  ["es_US", "es"],
  ["fr_FR", "fr-EU"],
  ["fr_US", "fr"],
  ["it_IT", "it"],
  ["ja_JP", "jp"],
  ["ko_KR", "ko"],
  ["nl_NL", "nl"],
  ["ru_RU", "ru"],
  ["zh_CN", "zh-CN"],
  ["zh_TW", "zh-TW"],
]);

for (const [name, canonical] of languages) {
  publisher.addLanguage(name, canonical);
}

const files = await readdir("tests/fixtures", { recursive: true });
const filenamePattern = /^(?<language>[^\/]+)\/(?<resource>.+)\.msbt$/v;

for (const file of files.toSorted()) {
  const groups = filenamePattern.exec(file.replaceAll(sep, "/"))?.groups;
  const language = groups?.["language"];

  if (language === undefined || !languages.has(language)) {
    continue;
  }

  const resource = groups!["resource"]!;
  // oxlint-disable-next-line no-await-in-loop
  const data = await readFile(join("tests/fixtures", file));

  for (const [reference, text] of extract(data)) {
    publisher.addReference(language, resource, reference, text);
  }
}

await publisher.save("tools/resources");
