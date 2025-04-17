import { Id } from "~/convex/_generated/dataModel";

export type Organizer = {
  _id: Id<"organizations">;
  ownerId: string;
  name: string;
  slug: string;
  events: string[];

  logo: string;
  location: {
    full?: string;
    locale?: string;
    city?: string;
    state?: string;
    stateAbbr?: string;
    region?: string;
    country: string;
    countryAbbr: string;
    continent?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    currency?: {
      code: string;
      name: string;
      symbol: string;
    };
    demonym?: string;
    timezone?: string;
    timezoneOffset?: number;
  };
  about?: string;
  contact: {
    organizer?: string;
    primaryContact: {
      email?: string;
      phone?: string;
      href?: string;
      social?: string;
    };
  };
  links: {
    website?: string;
    instagram?: string;
    facebook?: string;
    threads?: string;
    email?: string;
    vk?: string;
    phone?: string;
    address?: string;
    linkAggregate?: string;
    other?: string;
  };
  hadFreeCall: boolean;
  updatedAt?: number;
  lastUpdatedBy?: string;
};
