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
