import { Organizer } from "@/types/organizer";
import rawCountries, { Country } from "world-countries";

export interface MapboxContextItem {
  id: string;
  text: string;
  short_code?: string;
}

export interface MapboxSuggestion {
  id: string;
  address?: string;
  type: string;
  text: string;
  place_name: string;
  properties?: {
    short_code?: string;
  };
  place_type: string[];
  center: [number, number];
  context?: MapboxContextItem[];
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export const USAddressFormatCountries = [
  "United States",
  "Canada",
  "Mexico",
  "United Kingdom",
  "Australia",
  "Ireland",
  "New Zealand",
  "South Africa",
  "Philippines",
  "India",
  "Israel",
];

export const COUNTRIES_REQUIRING_STATE = [
  "US", // United States
  "CA", // Canada
  "AU", // Australia
  "MX", // Mexico
  "BR", // Brazil
  "IN", // India
  "NG", // Nigeria
];

export const EU_COUNTRIES = [
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
];

export const EuropeanEUCountries = [
  "Austria",
  "Belgium",
  "Bulgaria",
  "Croatia",
  "Cyprus",
  "Czechia",
  "Denmark",
  "Estonia",
  "Finland",
  "France",
  "Germany",
  "Greece",
  "Hungary",
  "Italy",
  "Latvia",
  "Lithuania",
  "Luxembourg",
  "Malta",
  "Netherlands",
  "Poland",
  "Portugal",
  "Romania",
  "Slovakia",
  "Slovenia",
  "Spain",
  "Sweden",
];

export const EuropeanNonEUCountries = [
  "Åland Islands",
  "Albania",
  "Andorra",
  "Belarus",
  "Bosnia and Herzegovina",
  "Faroe Islands",
  "Gibraltar",
  "Guernsey",
  "Iceland",
  "Ireland",
  "Isle of Man",
  "Jersey",
  "Kosovo",
  "Liechtenstein",
  "Moldova",
  "Monaco",
  "Montenegro",
  "North Macedonia",
  "Norway",
  "Russia",
  "San Marino",
  "Serbia",
  "Svalbard and Jan Mayen",
  "Switzerland",
  "Ukraine",
  "United Kingdom",
  "Vatican City",
];

export const EuropeanCountries = [
  ...EuropeanEUCountries,
  ...EuropeanNonEUCountries,
];

const continentOrder = [
  "North America",
  "Europe",
  "South America",
  "Asia",
  "Oceania",
];

export const select_continents = [
  { label: "Asia", value: "Asia" },
  { label: "Europe", value: "Europe" },
  { label: "North America", value: "North America" },
  { label: "Oceania", value: "Oceania" },
  { label: "South America", value: "South America" },
];

const getContinentLabel = (country: Country): string | null => {
  if (
    country.subregion === "North America" ||
    country.subregion === "South America"
  ) {
    return country.subregion;
  }

  if (continentOrder.includes(country.region)) {
    return country.region;
  }

  return null;
};

// Filter, group, and sort countries
const groupedCountries: Record<string, Country[]> = rawCountries
  .filter((country) => country.region !== "Antarctica")
  .reduce(
    (acc, country) => {
      const group = getContinentLabel(country);
      if (!group) return acc;

      if (!acc[group]) acc[group] = [];
      acc[group].push(country);
      return acc;
    },
    {} as Record<string, Country[]>,
  );

// Alphabetize countries within each group
for (const group of Object.keys(groupedCountries)) {
  groupedCountries[group] = groupedCountries[group].sort((a, b) =>
    a.name.common.localeCompare(b.name.common),
  );
}

// Final object with continents in desired order
export const sortedGroupedCountries: Record<string, Country[]> = {};
for (const region of continentOrder) {
  if (groupedCountries[region]) {
    sortedGroupedCountries[region] = groupedCountries[region];
  }
}

export const enhancedGroupedCountries: Record<string, Country[]> = {};

for (const region of continentOrder) {
  if (region === "Europe" && sortedGroupedCountries["Europe"]) {
    enhancedGroupedCountries["Europe: EU Countries"] = sortedGroupedCountries[
      "Europe"
    ].filter((country) => EU_COUNTRIES.includes(country.cca2));
    enhancedGroupedCountries["Europe: Non-EU Countries"] =
      sortedGroupedCountries["Europe"].filter(
        (country) => !EU_COUNTRIES.includes(country.cca2),
      );
  } else if (sortedGroupedCountries[region]) {
    enhancedGroupedCountries[region] = sortedGroupedCountries[region];
  }
}

export const nestedGroupedCountries: Record<
  string,
  Record<string, Country[]>
> = {};

for (const region of continentOrder) {
  if (region === "Europe" && sortedGroupedCountries["Europe"]) {
    nestedGroupedCountries["Europe"] = {
      "EU Countries": sortedGroupedCountries["Europe"].filter((country) =>
        EU_COUNTRIES.includes(country.cca2),
      ),
      "Non-EU Countries": sortedGroupedCountries["Europe"].filter(
        (country) => !EU_COUNTRIES.includes(country.cca2),
      ),
    };
  } else if (sortedGroupedCountries[region]) {
    nestedGroupedCountries[region] = {
      All: sortedGroupedCountries[region],
    };
  }
}

export const flattenedCountryOptions = Object.entries(
  sortedGroupedCountries,
).flatMap(([continent, countries]) =>
  countries.map((country) => ({
    label: country.name.common,
    value: country.cca2,
    group: continent,
  })),
);

export const countryToContinentMap: Record<string, string> = {};
flattenedCountryOptions.forEach(({ value, group }) => {
  countryToContinentMap[value] = group;
});

export const countryToCurrencyMap: Record<
  string,
  { code: string; name: string; symbol: string }
> = {};

rawCountries.forEach((country) => {
  const [code] = Object.keys(country.currencies || {});
  if (code) {
    countryToCurrencyMap[country.cca2] = {
      code,
      name: country.currencies[code].name,
      symbol: country.currencies[code].symbol,
    };
  }
});

export const countryToDemonymMap: Record<string, string> = {};

rawCountries.forEach((country) => {
  const demonym = country.demonyms?.eng?.m;
  if (demonym) {
    countryToDemonymMap[country.cca2] = demonym;
  }
});

export function getDemonym(countryName: string): string {
  const country = rawCountries.find(
    (c) =>
      c.name.common.toLowerCase() === countryName.toLowerCase() ||
      c.name.official.toLowerCase() === countryName.toLowerCase(),
  );
  return country?.demonyms?.eng?.m || countryName; // fallback to name if not found
}

export const usRegions = {
  Midwest: [
    "IL",
    "IN",
    "IA",
    "KS",
    "MI",
    "MN",
    "MO",
    "NE",
    "ND",
    "OH",
    "SD",
    "WI",
  ],
  South: [
    "AL",
    "AR",
    "FL",
    "GA",
    "KY",
    "LA",
    "MS",
    "NC",
    "OK",
    "SC",
    "TN",
    "TX",
    "VA",
    "WV",
  ],
  Northeast: ["CT", "DE", "ME", "MD", "MA", "NH", "NJ", "NY", "PA", "RI", "VT"],
  West: [
    "AK",
    "AZ",
    "CA",
    "CO",
    "HI",
    "ID",
    "MT",
    "NV",
    "NM",
    "OR",
    "UT",
    "WA",
    "WY",
  ],
};

export const stateToRegionMap: Record<string, string> = {};
Object.entries(usRegions).forEach(([region, states]) => {
  states.forEach((abbr) => {
    stateToRegionMap[abbr] = region;
  });
});

export const searchLocation = async (query: string) => {
  const res = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query,
    )}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&types=place,region,country`,
  );

  if (!res.ok) throw new Error("Mapbox request failed");
  const data = await res.json();
  console.log(data);

  return data.features;
};

//NOTE: For only city/state/country searches, do this:  `...json?access_token=${MAPBOX_TOKEN}&autocomplete=true&types=place,region,country`
export async function fetchMapboxSuggestions(query: string) {
  if (!query.trim()) return [];

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    query,
  )}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&types=place,region,country`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch suggestions");

  const data = await res.json();
  console.log("suggestion data:", data);
  return data.features as MapboxSuggestion[];
}

// export async function fetchMapboxSuggestionsFull(query: string) {
//   if (!query.trim()) return [];

//   const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
//     query,
//   )}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&types=locality,neighborhood,district,place,region,country`;

//   const res = await fetch(url);
//   if (!res.ok) throw new Error("Failed to fetch suggestions");

//   const data = await res.json();
//   // console.log("suggestion data:", data);
//   return data.features as MapboxSuggestion[];
// }

export async function fetchMapboxSuggestionsFull(
  query: string,
  includeFullAddress = false,
) {
  if (!query.trim()) return [];

  const types = includeFullAddress
    ? "address,locality,neighborhood,district,place,region,country"
    : "locality,neighborhood,district,place,region,country";

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    query,
  )}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&types=${types}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch suggestions");

  const data = await res.json();
  return data.features as MapboxSuggestion[];
}

type OrgLocationProps = Pick<Organizer, "location">;

export function getOrganizerLocationString(
  organizer: OrgLocationProps,
  abbreviated: boolean,
): string {
  const { location } = organizer;
  const isValidStateAbbr =
    location?.stateAbbr && /^[A-Za-z]+$/.test(location?.stateAbbr);

  const parts = [
    !abbreviated && location?.locale && `${location.locale}`,
    location?.city && `${location.city}`,
    location?.city && isValidStateAbbr && `${location.stateAbbr}`,
    !location?.city && location?.state && `${location.state}`,

    location?.countryAbbr === "US" ? "USA" : location?.country,
  ];

  return parts.filter(Boolean).join(", ");
}
export function getSearchLocationString(
  city?: string,
  countryAbbr?: string,
  stateAbbr?: string,
): string {
  const isValidStateAbbr = stateAbbr && /^[A-Za-z]+$/.test(stateAbbr);

  const parts = [
    city && `${city}`,
    city && isValidStateAbbr && `${stateAbbr}`,
    countryAbbr === "US" ? "USA" : countryAbbr,
  ];

  return parts.filter(Boolean).join(", ");
}

export function getFormattedLocationString(
  location: {
    full?: string;
    locale?: string;
    city?: string;
    state?: string;
    stateAbbr?: string;
    region?: string;
    country: string;
    countryAbbr?: string;
    continent?: string;
    coordinates?: { latitude: number; longitude: number };
  },
  abbreviated?: boolean,
): string {
  const { locale, city, stateAbbr, state, country, countryAbbr } = location;
  const isValidStateAbbr = stateAbbr && /^[A-Za-z]+$/.test(stateAbbr);

  return [
    locale,
    city,
    city && isValidStateAbbr ? stateAbbr : null,
    !city && state ? state : null,
    countryAbbr === "US"
      ? "USA"
      : countryAbbr === "GB" && abbreviated
        ? "UK"
        : country,
  ]
    .filter(Boolean)
    .join(", ");
}

type Location = {
  city?: string;
  stateAbbr?: string;
  countryAbbr?: string;
};

export const sortByLocation = <T>(
  list: T[],
  countriesRequiringState: string[],
  getLocation: (item: T) => Location | undefined,
): T[] => {
  return [...list].sort((a, b) => {
    const aLoc = getLocation(a);
    const bLoc = getLocation(b);

    const isStateRequiredA = countriesRequiringState.includes(
      aLoc?.countryAbbr ?? "",
    );
    const isStateRequiredB = countriesRequiringState.includes(
      bLoc?.countryAbbr ?? "",
    );

    let aPrimary = "";
    let bPrimary = "";
    let aSecondary = "";
    let bSecondary = "";

    if (isStateRequiredA) {
      aPrimary = aLoc?.stateAbbr ?? "";
      aSecondary = aLoc?.city ?? "";
    } else {
      aPrimary = aLoc?.city ?? "";
    }

    if (isStateRequiredB) {
      bPrimary = bLoc?.stateAbbr ?? "";
      bSecondary = bLoc?.city ?? "";
    } else {
      bPrimary = bLoc?.city ?? "";
    }

    const primaryCompare = aPrimary.localeCompare(bPrimary);
    return primaryCompare !== 0
      ? primaryCompare
      : aSecondary.localeCompare(bSecondary);
  });
};
