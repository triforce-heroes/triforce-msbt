export function hash(label: string, slots = 101) {
  let result = 0n;

  for (let i = 0; i < label.length; i++) {
    result = result * 0x04_92n + BigInt(label.codePointAt(i)!);
  }

  // eslint-disable-next-line no-bitwise
  return Number(result & BigInt(0xff_ff_ff_ff)) % slots;
}
