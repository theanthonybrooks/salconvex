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
  if (!cleanValue) return "";

  if (
    (/\.\w{2,}/.test(cleanValue) || cleanValue.startsWith("http")) &&
    // /\/[a-zA-Z0-9@._-]{3,}$/.test(cleanValue)
    /\/[a-zA-Z0-9@._-]{3,}\/?$/.test(cleanValue)
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

export function formatFacebookInput(input: string): string {
  if (!input) return "";

  const trimmed = input.trim().replace(/^\/+/, "");
  const lower = trimmed.toLowerCase();

  const containsFacebook = lower.includes("facebook.com");
  const startsWithHttp = lower.includes("http");
  const containsWww = lower.includes("www");

  const formatHandle = (handle: string) =>
    handle.startsWith("@") ? handle : `@${handle}`;

  if (containsFacebook || containsWww) {
    const urlString = startsWithHttp ? trimmed : `https://${trimmed}`;
    try {
      const url = new URL(urlString);
      const hostnameOk = url.hostname.endsWith("facebook.com");
      const pathParts = url.pathname.split("/").filter(Boolean);
      const hasQueryParams = !!url.search;
      const isCleanHandle =
        hostnameOk &&
        pathParts.length === 1 &&
        !hasQueryParams &&
        /^[a-zA-Z0-9.]{5,50}$/.test(pathParts[0]) &&
        !pathParts[0].includes("..") &&
        !pathParts[0].endsWith(".");

      if (isCleanHandle) {
        return formatHandle(pathParts[0]);
      } else {
        return url.href;
      }
    } catch {
      return formatHandle(trimmed);
    }
  }

  return formatHandle(trimmed);

  // try {
  //   const url = new URL(
  //     trimmed.startsWith("http") ? trimmed : `https://${trimmed}`,
  //   );

  //   // Ensure it's a facebook.com link
  //   // if (!url.hostname.includes("facebook.com")) return "";
  //   const hostnameOk = url.hostname.endsWith("facebook.com");

  //   const pathParts = url.pathname.split("/").filter(Boolean);
  //   const hasQueryParams = !!url.search;
  //   const isCleanHandle =
  //     hostnameOk &&
  //     pathParts.length === 1 &&
  //     !hasQueryParams &&
  //     /^[a-zA-Z0-9.]{5,50}$/.test(pathParts[0]) &&
  //     !pathParts[0].includes("..") &&
  //     !pathParts[0].endsWith(".");

  //   if (isCleanHandle) {
  //     return `@${pathParts[0]}`;
  //   } else {
  //     return url.href;
  //   }
  // } catch {
  //   // If it's not a URL, treat as a raw handle
  //   const clean = trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
  //   return clean;
  // }
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

// export function autoHttps(url: string) {
//   const raw = url.trim();
//   return raw && !/^https?:\/\//i.test(raw) ? `https://${raw}` : raw;
// }

export function autoHttps(url: string): string {
  const raw = url.trim();
  if (!raw) return "";

  // Allow mailto: explicitly
  if (/^mailto:/i.test(raw)) {
    return raw;
  }

  // Remove malformed or valid http(s) protocol
  const cleaned = raw.replace(/^https?:\/{0,2}/i, "");

  return `https://${cleaned}`;
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
    .replace(/^@/, "")
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

export const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
