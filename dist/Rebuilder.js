import{BufferBuilder as n}from"@triforce-heroes/triforce-core";import{hash as e}from"./utils/hash.js";export function rebuild(t,i=101){let r=new Map(Array.from({length:i},(n,e)=>[e,[]])),g=new n,l=new n,d=4+4*t.length;for(let[n,w]of t.entries()){let t=d+l.length;g.writeUnsignedInt32(t),l.push(Buffer.from(`${w[1]}\0`,"utf16le")),r.get(e(w[0],i)).push([w[0],n])}let w=new n,s=new n,u=4+8*i;for(let n of(w.writeUnsignedInt32(i),r.values()))for(let[e,t]of(w.writeUnsignedInt32(n.length),w.writeUnsignedInt32(u+s.length),n))s.writeLengthPrefixedString(e,1),s.writeUnsignedInt32(t);return function(e,t,i){let r=new n;return r.writeString("MsgStdBn"),r.writeUnsignedInt16(65279),r.writeUnsignedInt16(0),r.writeUnsignedInt8(1),r.writeUnsignedInt8(3),r.writeUnsignedInt16(3),r.writeUnsignedInt16(0),r.writeUnsignedInt32(32+e.length+t.length+i.length),r.write(10),r.push(e,t,i),r.build()}(function(e,t){let i=new n;return i.writeString("LBL1"),i.writeUnsignedInt32(e.length+t.length),i.pad(16),i.push(e,t),i.pad(16,"«"),i.build()}(w.build(),s.build()),function(e){let t=new n;return t.writeString("ATR1"),t.writeUnsignedInt32(8),t.pad(16),t.writeUnsignedInt32(e.length),t.writeUnsignedInt32(0),t.pad(16,"«"),t.build()}(t),function(e,t,i){let r=new n;return r.writeString("TXT2"),r.writeUnsignedInt32(4+t.length+i.length),r.pad(16),r.writeUnsignedInt32(e.length),r.push(t,i),r.pad(16,"«"),r.build()}(t,g.build(),l.build()))}