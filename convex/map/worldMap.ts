import { validOCVals } from "@/constants/openCallConsts";
import { v } from "convex/values";
import { query } from "~/convex/_generated/server";

export const worldMapFiltersSchema = v.object({
  country: v.optional(v.string()),
  continent: v.optional(v.string()),
  city: v.optional(v.string()),
  state: v.optional(v.string()),
});

export const getWorldMapData = query({
  args: {
    filters: worldMapFiltersSchema,
  },
  handler: async (ctx, args) => {
    const { filters } = args;
    const country = filters.country;
    const continent = filters.continent;
    const city = filters.city;
    const state = filters.state;

    // const query = ctx.db
    //     .query("events")
    //     .withIndex("by_state", (q) => q.eq("state", state))
    //     .withIndex("by_country", (q) => q.eq("country", country))
    //     .withIndex("by_continent", (q) => q.eq("continent", continent))
    //     .withIndex("by_city", (q) => q.eq("city", city))
    //     .withIndex("by_location", (q) => q.eq("location.full", city))
    //     .withIndex("by_location", (q) => q.eq("location.full", state))
    //     .withIndex("by_location", (q) => q.eq("location.full", country))
    //     .withIndex("by_location", (q) => q.eq("location.full", continent))
    //     .order("desc")
    //     .limit(100);

    //! For now, just querying the events table, but will make a lookup table just for the map data later. I think? It will need to be a fairly comprehensive lookup, so I may just add the map data to the eventLookup table.

    const query = ctx.db.query("events");

    // if (country) {
    //     query.withIndex("by_country", (q) => q.eq("country", country))
    // }
    // if (continent) {
    //     query.withIndex("by_continent", (q) => q.eq("continent", continent))
    // }
    // if (city) {
    //     query.withIndex("by_city", (q) => q.eq("city", city))
    // }

    query.withIndex("by_state_approvedAt", (q) =>
      q.eq("state", "published").gt("approvedAt", undefined),
    );

    const events = await query.collect();
    const eventData = events.map((event) => {
      const coords = event.location?.coordinates;

      return {
        latitude: coords?.latitude ?? 0,
        longitude: coords?.longitude ?? 0,
        label: event.name,
        meta: {
          category: event.category,
          eventType: event.type,
          slug: event.slug,
          hasOpenCall: validOCVals.includes(event.hasOpenCall),
          logo: event.logo,
          description: event.blurb ?? event.about,
          edition: event.dates.edition,
        },
      };
    });

    return eventData;
  },
});
