import { TooltipSimple } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Organizer } from "@/types/organizer";
import { Globe, Phone } from "lucide-react";
import React from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaLink,
  FaRegEnvelope,
  FaThreads,
  FaVk,
  FaYoutube,
} from "react-icons/fa6";

const iconSize = "size-5";

const linkDisplayOrder: (keyof Organizer["links"])[] = [
  "email",
  "website",
  "phone",
  "linkAggregate",
  "instagram",
  "facebook",
  "threads",
  "vk",
  "youTube",
];

const displayNames: Record<keyof Organizer["links"], string> = {
  website: "Website",
  email: "Email",
  phone: "Phone",
  phoneExt: "Phone Ext",
  linkAggregate: "Link Aggregate",
  instagram: "Instagram",
  facebook: "Facebook",
  threads: "Threads",
  vk: "VK",
  youTube: "YouTube",
  address: "Address",
  other: "Other",
};

const organizerLinkIcons: Record<keyof Organizer["links"], React.ReactNode> = {
  website: <Globe className={iconSize} />,
  email: <FaRegEnvelope className={iconSize} />,
  phone: <Phone className={iconSize} />,
  phoneExt: <Phone className={iconSize} />,
  linkAggregate: <FaLink className={iconSize} />,
  instagram: <FaInstagram className={iconSize} />,
  facebook: <FaFacebookF className={iconSize} />,
  threads: <FaThreads className={iconSize} />,
  vk: <FaVk className={iconSize} />,
  youTube: <FaYoutube className={iconSize} />,
  address: null,
  other: null,
};

const getLinkHref = (
  type: keyof Organizer["links"],
  value: string,
  orgName: string,
) => {
  if (type === "email") return `mailto:${value}?subject=${orgName}`;
  if (type === "phone") return `tel:${value}`;
  if (type === "instagram")
    return `https://www.instagram.com/${value.split("@").slice(-1)[0]}`;
  if (type === "facebook")
    return `https://www.facebook.com/${value.split("@").slice(-1)[0]}`;
  if (type === "threads") return `https://www.threads.com/${value}`;
  if (type === "vk") return `https://vk.com/${value.split("@").slice(-1)[0]}`;
  return value;
};

interface OrganizerLinksProps {
  organizer: Organizer;
  fontSize?: "text-sm" | "text-base";
}

export const OrganizerLinks = ({
  organizer,
  fontSize,
}: OrganizerLinksProps) => {
  return (
    <section>
      <p className={cn("font-semibold", fontSize)}>Links:</p>
      <div className="flex items-center justify-start gap-x-6 pt-2">
        {linkDisplayOrder.map((key) => {
          const value = organizer.links?.[key];
          const icon = organizerLinkIcons[key];
          const orgName = organizer.name;

          if (!value || !icon) return null;

          return (
            <TooltipSimple key={key} content={displayNames[key]}>
              <a
                key={key}
                href={getLinkHref(key, value, orgName)}
                className="size-6 hover:scale-110"
              >
                {icon}
              </a>
            </TooltipSimple>
          );
        })}
      </div>
    </section>
  );
};
