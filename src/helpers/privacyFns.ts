export const onEmailChange = (
  inputEmail: string,
  onSetFunction: (value: string) => void,
) => {
  if (!inputEmail.includes("@")) {
    onSetFunction(inputEmail);
    return;
  }

  const [username, domain] = inputEmail.split("@");

  // Safety check: bad input or too short to obfuscate
  if (!username || username.length < 2 || !domain || !domain.includes(".")) {
    onSetFunction(inputEmail);
    return;
  }

  // Obfuscate username
  const visibleNameChars = 2;
  const maxNameAsterisks = 4;
  const nameStart = username.slice(0, visibleNameChars);
  const nameObscured = "*".repeat(
    Math.min(maxNameAsterisks, Math.max(1, username.length - visibleNameChars)),
  );

  // Obfuscate domain (just the name, not the TLD)
  const [domainName, domainTLD] = domain.split(".");
  if (!domainName || !domainTLD) {
    onSetFunction(inputEmail);
    return;
  }

  const visibleDomainChars = 1;
  const maxDomainAsterisks = 3;
  const domainStart = domainName.slice(0, visibleDomainChars);
  const domainEnd = domainName.slice(-1);
  const domainObscured = `${domainStart}${"*".repeat(
    Math.min(
      maxDomainAsterisks,
      Math.max(1, domainName.length - 2 * visibleDomainChars),
    ),
  )}${domainEnd}.${domainTLD}`;

  onSetFunction(`${nameStart}${nameObscured}@${domainObscured}`);
};

export async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
