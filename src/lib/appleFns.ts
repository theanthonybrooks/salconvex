export function isAppleUA(ua: string) {
  if (!ua) return false;

  const isIOS = /(iPhone|iPad|iPod)/i.test(ua);

  const isMacSafari =
    /Macintosh/.test(ua) &&
    /Safari\//.test(ua) &&
    !/(Chrome|CriOS|Chromium|Edg|OPR|Brave|DuckDuckGo)/i.test(ua);

  return isIOS || isMacSafari;
}
