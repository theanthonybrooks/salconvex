import { formatDisplayUrl } from "@/helpers/linkFns";
import { Globe, Phone } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaRegEnvelope,
  FaThreads,
  FaVk,
} from "react-icons/fa6";
import { formatPhoneNumberIntl } from "react-phone-number-input";

const contactIcons: Record<string, React.ReactNode> = {
  email: <FaRegEnvelope />,
  phone: <Phone />,
  facebook: <FaFacebookF />,
  instagram: <FaInstagram />,
  threads: <FaThreads />,
  vk: <FaVk />,
  website: <Globe />,
};

const contactHref = (type: string, value: string) => {
  switch (type) {
    case "email":
      return `mailto:${value}`;
    case "phone":
      return `tel:${value}`;
    case "instagram":
      return `https://instagram.com/${value.replace("@", "")}`;
    case "facebook":
      return `https://facebook.com/${value.replace("@", "")}`;
    case "threads":
      return `https://threads.net/${value.replace("@", "")}`;
    case "vk":
      return `https://vk.com/${value.replace("@", "")}`;
    default:
      return value;
  }
};

const contactLabel = (type: string, value: string) => {
  switch (type) {
    case "phone":
      return formatPhoneNumberIntl(value);
    case "website":
      return formatDisplayUrl(value);
    default:
      return value;
  }
};

import { cn } from "@/helpers/utilsFns";
import { Organizer } from "@/types/organizer";
import React from "react";

export type OrgContactProps = Pick<Organizer, "contact" | "links">;
interface OrganizerMainContactProps {
  organizer: OrgContactProps;
  linkOnly?: boolean;
  fontSize?: "text-sm" | "text-base";
}

export const OrganizerMainContact = ({
  organizer,
  linkOnly = false,
  fontSize = "text-sm",
}: OrganizerMainContactProps) => {
  const primaryContact = organizer.contact?.primaryContact;
  const value = primaryContact && organizer.links[primaryContact];

  if (!primaryContact || !value) return null;
  return (
    <span className={cn(fontSize)}>
      {!linkOnly && <p className={cn("font-semibold")}>Main Contact:</p>}{" "}
      <div className={cn("flex items-center gap-x-2 pt-2", linkOnly && "pt-0")}>
        {contactIcons[primaryContact] ?? <Globe />}
        <a
          href={contactHref(primaryContact, value)}
          className="line-clamp-4 underline-offset-2 hover:underline"
        >
          {contactLabel(primaryContact, value)}
        </a>
      </div>
    </span>
  );
};
