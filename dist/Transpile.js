import{parseEntries as r}from"./parser/parseEntries.js";import{parseHeader as e}from"./parser/parseHeader.js";import{parseSections as s}from"./parser/parseSections.js";export function transpile(p){let t=e(p),o=s(p,t);return r(t,o)}