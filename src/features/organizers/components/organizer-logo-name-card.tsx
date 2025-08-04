import { Card } from "@/components/ui/card";
import { Link } from "@/components/ui/custom-link";
import { EventOrgLogo } from "@/components/ui/event-org-logo";
import { getOrganizerLocationString } from "@/lib/locations";
import { cn } from "@/lib/utils";
import { Organizer } from "@/types/organizer";
import React from "react";
import slugify from "slugify";

type MinimalOrgCardProps = Pick<Organizer, "logo" | "name" | "location">;

interface OrganizerCardProps {
  organizer: MinimalOrgCardProps;
}

interface OrganizerCardLogoNameProps extends OrganizerCardProps {
  format?: "desktop" | "mobile";
}

interface OrganizerLogoNameCardProps extends OrganizerCardProps {
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  abbr?: boolean;
}

export const OrganizerLogoNameCard = ({
  setActiveTab,
  organizer,
  abbr = false,
}: OrganizerLogoNameCardProps) => {
  const orgLocationString = getOrganizerLocationString(organizer, abbr);

  return (
    <Card
      className="grid w-full grid-cols-[50px_minmax(0,1fr)] items-center rounded-xl border-1.5 border-foreground/30 bg-white/50 p-2 hover:cursor-pointer"
      onClick={() => {
        window.scrollTo({
          top: document.body.scrollHeight * 0.1,
          behavior: "smooth",
        });
        setActiveTab("organizer");
      }}
    >
      <EventOrgLogo imgSrc={organizer.logo} type="organizer" size="small" />
      <div className="col-span-1">
        <p className="max-w-[18ch] truncate text-sm font-bold">
          {organizer.name}
        </p>
        <p className="max-w-[18ch] truncate text-xs">{orgLocationString}</p>
      </div>
    </Card>
  );
};

export const OrganizerCardLogoName = ({
  organizer,
  format,
}: OrganizerCardLogoNameProps) => {
  const orgLocationString = getOrganizerLocationString(organizer, true);
  const isMobile = format === "mobile";
  const slug = slugify(organizer.name, { lower: true, strict: true });

  return (
    <Link href={`/thelist/organizer/${slug}`}>
      <div
        className={cn(
          "grid w-full grid-cols-[60px_minmax(0,1fr)] items-center",
          isMobile && "grid-cols-[75px_minmax(0,1fr)]",
        )}
      >
        <EventOrgLogo
          imgSrc={organizer?.logo || "/1.jpg"}
          className={cn(
            "size-[50px] rounded-full border-1.5 border-foreground",
            isMobile && "size-15 border-2",
          )}
        />

        <div className="col-span-1">
          <p className="line-clamp-2 text-sm font-bold">{organizer.name}</p>
          <p className={cn("text-sm", isMobile && "font-medium")}>
            {orgLocationString}
          </p>
        </div>
      </div>
    </Link>
  );
};
