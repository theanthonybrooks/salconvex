import { formatDisplayUrl } from "@/lib/linkFns";
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

import { Organizer } from "@/types/organizer";
import React from "react";

interface OrganizerMainContactProps {
  organizer: Organizer;
}

export const OrganizerMainContact = ({
  organizer,
}: OrganizerMainContactProps) => {
  const primaryContact = organizer.contact.primaryContact;
  const value = organizer.links[primaryContact];

  if (!value) return null;
  return (
    <span>
      <p className="text-sm font-semibold">Main Contact:</p>
      <div className="flex items-center gap-x-2 pt-2">
        {contactIcons[primaryContact] ?? <Globe />}
        <a
          href={contactHref(primaryContact, value)}
          className="line-clamp-4 text-sm underline-offset-2 hover:underline"
        >
          {contactLabel(primaryContact, value)}
        </a>
      </div>
    </span>
  );
};
