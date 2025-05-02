export type PlatformType =
  | "facebook"
  | "instagram"
  | "threads"
  | "vk"
  | "email"
  | "website"
  | "generic";

export const platformDomains: Record<PlatformType, string[]> = {
  instagram: ["instagram.com"],
  threads: ["threads.com"],
  facebook: ["facebook.com"],
  vk: ["vk.com"],
  email: [],
  website: [],
  generic: [],
};

const allowedCharacters = /^[a-zA-Z0-9._]+$/;

export function formatHandleInput(
  value: string,
  platform: PlatformType,
): string {
  if (!value) return "";

  let cleanValue = value.trim().replace(/^\/+/, "");

  if (
    (/\.\w{2,}/.test(cleanValue) || cleanValue.startsWith("http")) &&
    /\/[a-zA-Z0-9@._-]{3,}$/.test(cleanValue)
  ) {
    try {
      const url = new URL(
        cleanValue.startsWith("http") ? cleanValue : `https://${cleanValue}`,
      );

      const allowedDomains = platformDomains[platform];
      if (
        allowedDomains.length > 0 &&
        !allowedDomains.some((domain) => url.hostname.endsWith(domain))
      ) {
        return "";
      }
      const pathParts = url.pathname.split("/").filter(Boolean);
      if (pathParts.length !== 1 || !pathParts[0]) return "";
      cleanValue = pathParts[0];
    } catch (e) {
      console.log(e);
      return "";
    }
  } else if (cleanValue.includes("/") || cleanValue.includes(" ")) {
    return "";
  }

  cleanValue = cleanValue.startsWith("@") ? cleanValue : `@${cleanValue}`;

  const usernameWithoutAt = cleanValue.slice(1);
  const validUsername = [...usernameWithoutAt]
    .filter((char) => isValidChar(char, platform))
    .join("");

  return `@${validUsername}`;
}

function isValidChar(char: string, platform: PlatformType): boolean {
  switch (platform) {
    case "instagram":
    case "threads":
    case "vk":
      return /^[a-zA-Z0-9._]$/.test(char);
    case "facebook":
      return /^[a-zA-Z0-9.]$/.test(char);
    case "generic":
    default:
      return allowedCharacters.test(char);
  }
}

export function autoHttps(url: string) {
  const raw = url.trim();
  return raw && !/^https?:\/\//i.test(raw) ? `https://${raw}` : raw;
}

export function formatDisplayUrl(url: string): string {
  return url.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
}

export function formatUrlToHandle(url: string, platformDomain: string): string {
  if (!url) return "";

  const normalized = url.replace(/^https?:\/\//i, "").replace(/^www\./i, "");

  const prefix = `${platformDomain}/`;
  const index = normalized.indexOf(prefix);

  if (index !== -1) {
    return "@" + normalized.slice(index + prefix.length).replace(/\/$/, "");
  }

  return url.startsWith("@") ? url : `@${url}`;
}

export function normalizeToHandle(value: string, domain: string): string {
  if (!value) return "";
  return value
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(new RegExp(`^${domain}/?`, "i"), "")
    .replace(/\/$/, "")
    .replace(/^@/, "") // remove existing @ to avoid @@
    .trim()
    ? `@${value
        .replace(/^https?:\/\//i, "")
        .replace(/^www\./i, "")
        .replace(new RegExp(`^${domain}/?`, "i"), "")
        .replace(/\/$/, "")
        .replace(/^@/, "")
        .trim()}`
    : "";
}
