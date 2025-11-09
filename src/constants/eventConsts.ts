export const freeEvents = ["gjm", "pup"];
export const paidEvents = ["mur", "saf", "mus", "oth"];
export const prodOnlyCategories = ["project", "residency"];
export const hasProductionCategories = ["event", ...prodOnlyCategories];
export const noProdCategories = ["gfund", "roster"];
export const noEventCategories = [...noProdCategories, ...prodOnlyCategories];
export const eventTypeOptions = [
  {
    value: "gjm",
    label: "Graffiti Jam",
    abbr: "Graffiti Jam",
    // icon: Paintbrush,
  },
  {
    value: "mur",
    label: "Mural Project",
    abbr: "Mural Project",
    // icon: Paintbrush,
  },
  {
    value: "saf",
    label: "Street Art Festival",
    abbr: "Street Art Fest",
    // icon: Paintbrush,
  },
  {
    value: "pup",
    label: "Paste Up/Sticker",
    abbr: "Paste Up",
    // icon: Paintbrush,
  },
  {
    value: "mus",
    label: "At music festival",
    abbr: "Music Fest",
    // icon: Paintbrush,
  },
  {
    value: "oth",
    label: "Other",
    abbr: "Other",
    // icon: Paintbrush
  },
] as const;

export const eventCategoryOptions = [
  { value: "event", label: "Event", abbr: "Event" },
  { value: "project", label: "Mural Project", abbr: "Project" },
  { value: "residency", label: "Residency", abbr: "Residency" },
  { value: "gfund", label: "Grant/Funding", abbr: "Grant/Fund" },
  { value: "roster", label: "Artist Roster", abbr: "Roster" },
] as const;

export const approvedStates = ["published", "archived"];

export const prodFormatValues = [
  "sameAsEvent",
  "setDates",
  "monthRange",
  "yearRange",
  "seasonRange",
  "noProd",
] as const;
export const eventFormatValues = [
  "noEvent",
  "setDates",
  "monthRange",
  "yearRange",
  "seasonRange",
  "ongoing",
] as const;

export const PostStatusOptionValues = [
  { value: "posted", label: "Posted" },
  { value: "toPost", label: "To Post" },
  { value: "all", label: "All" },
] as const;
export const eventTypeValues = eventTypeOptions.map(
  (o) => o.value,
) as readonly [...(typeof eventTypeOptions)[number]["value"][]];

export const eventCategoryValues = eventCategoryOptions.map(
  (o) => o.value,
) as readonly [...(typeof eventCategoryOptions)[number]["value"][]];

export const PostStatusValues = PostStatusOptionValues.map(
  (o) => o.value,
) as readonly [...(typeof PostStatusOptionValues)[number]["value"][]];
