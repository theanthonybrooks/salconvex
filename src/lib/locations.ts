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

  const parts = [
    !abbreviated && location?.locale && `${location.locale}`,
    location?.city && `${location.city}`,
    location?.city && location?.stateAbbr && `${location.stateAbbr}`,
    !location?.city && location?.state && `${location.state}`,

    location?.countryAbbr === "UK" ||
    location?.countryAbbr === "USA" ||
    location?.country === "United States"
      ? location?.countryAbbr
      : location?.country,
  ];

  return parts.filter(Boolean).join(", ");
}
export function getSearchLocationString(
  city?: string,
  countryAbbr?: string,
  stateAbbr?: string,
): string {
  const parts = [
    city && `${city}`,
    city && stateAbbr && `${stateAbbr}`,
    countryAbbr,
  ];

  return parts.filter(Boolean).join(", ");
}
