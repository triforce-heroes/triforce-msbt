import{BufferConsumer as e}from"@triforce-heroes/triforce-core/BufferConsumer";import r from"iconv-lite";export function parseEntries(t,n){let o=n.get("LBL1"),i=new e(o,void 0,t.bom).readUnsignedInt32(),d=new Map,s=new e(o.subarray(4+8*i),void 0,t.bom);for(;!s.isConsumed();){let e=s.readLengthPrefixedString(1),r=s.readUnsignedInt32();d.set(r,e)}let a=n.get("TXT2"),f=new e(a,void 0,t.bom),g=f.readUnsignedInt32(),m=[];for(let e=0;e<g;e++){let n=f.readUnsignedInt32(),o=e===g-1?a.length-2:f.readUnsignedInt32()-2;f.back(4);let i=d.get(e),s=a.subarray(n,o);m.push([i,1===t.bom?r.decode(s,"utf16be"):s.toString("utf16le")])}return m}