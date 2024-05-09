export function convertColor(hexString: string): number {
  return parseInt(hexString.replace('#', '0x'));
}