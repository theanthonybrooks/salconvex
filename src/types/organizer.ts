import { Id } from "~/convex/_generated/dataModel";

export type Organizer = {
  _id: Id<"organizations">;
  ownerId: string;
  name: string;
  events: string[];

  logo: string;
  location: {
    locale?: string;
    city?: string;
    state?: string;
    stateAbbr?: string;
    region?: string;
    country?: string;
    countryAbbr?: string;
    continent?: string;
  };
  about: string;
  contact: {
    organizer: string;
    primaryContact: {
      email?: string;
      phone?: string;
      href?: string;
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
  };
  hadFreeCall: boolean;
  updatedAt?: number;
  lastUpdatedBy?: string;
};
