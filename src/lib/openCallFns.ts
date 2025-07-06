export function getCallFormatLabel(callFormat: string): string {
  switch (callFormat) {
    case "RFP":
      return "Request for Proposals";
    case "RFQ":
      return "Request for Qualifications";
    case "RFA":
      return "Request for Artworks";
    default:
      return "Unknown";
  }
}

export const sortByOcStatus = <T extends { ocStatus: number }>(arr: T[]) => {
  const order: Record<string, number> = { "2": 0, "3": 1, "1": 2, "0": 3 };
  return arr.sort(
    (a, b) =>
      (order[String(a.ocStatus)] ?? 4) - (order[String(b.ocStatus)] ?? 4),
  );
};
