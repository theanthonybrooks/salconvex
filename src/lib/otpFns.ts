const DIGITS = "0123456789";
export function generateNumericToken(length = 6): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < length; i++) out += DIGITS[bytes[i] % DIGITS.length];
  return out;
}
