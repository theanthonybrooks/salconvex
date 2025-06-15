import { formatDisplayUrl } from "@/lib/linkFns";
import { cn } from "@/lib/utils";
import { EventData } from "@/types/event";
import { Organizer } from "@/types/organizer";
import { Globe, Phone } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLink,
  FaPlus,
  FaRegEnvelope,
  FaThreads,
  FaVk,
} from "react-icons/fa6";
import { formatPhoneNumberIntl } from "react-phone-number-input";

interface MinimalEventLinks {
  name: string;
  links?: EventData["links"];
}

interface MinimalOrgLinks {
  name: string;
  links?: Organizer["links"];
}

interface LinkListProps {
  event?: MinimalEventLinks;
  organizer?: MinimalOrgLinks;
  purpose?: string;
}

export const LinkList = ({ event, organizer, purpose }: LinkListProps) => {
  const listPreview = purpose === "preview";
  const submitRecap = purpose === "recap";

  const visibleEventLinks =
    event?.links &&
    Object.entries(event.links).filter(([key, value]) => {
      if (!value) return false;
      if (
        listPreview &&
        ["email", "phone", "linkAggregate", "other"].includes(key)
      ) {
        return false;
      }
      return true;
    });

  const totalVisibleLinks = visibleEventLinks?.length || 0;
  if (totalVisibleLinks === 0 && !submitRecap) {
    return <div className="p-3 italic">See event details for full links</div>;
  }

  const iconSize = submitRecap ? "size-3.5" : "size-5";
  console.log(event?.links);
  console.log(organizer?.links);

  return (
    <>
      {event && event.links && event.links.sameAsOrganizer !== true && (
        <div
          className={cn(
            "flex flex-col gap-y-2",
            !listPreview && "p-3",
            submitRecap && "p-0",
          )}
        >
          {event.links?.email && !listPreview && (
            <a href={`mailto:${event.links.email}?subject=${event.name}`}>
              <div className="flex items-center gap-x-2">
                <FaRegEnvelope className={cn("shrink-0", iconSize)} />
                <span className="underline-offset-2 hover:underline">
                  {event.links.email}
                </span>
              </div>
            </a>
          )}
          {event.links?.website && (
            <a href={event.links.website} target="_blank">
              <div className="flex items-center gap-x-2">
                <Globe className={cn("shrink-0", iconSize)} />
                <span className="max-w-[30ch] truncate underline-offset-2 hover:underline">
                  {formatDisplayUrl(event.links.website)}
                </span>
              </div>
            </a>
          )}
          {event.links?.phone && !listPreview && (
            <a href={`tel:${event.links.phone}`} target="_blank">
              <div className="flex items-center gap-x-2">
                <Phone className={cn("shrink-0", iconSize)} />
                <span className="underline-offset-2 hover:underline">
                  {formatPhoneNumberIntl(event.links.phone)}
                </span>
              </div>
            </a>
          )}
          {event.links?.linkAggregate && !listPreview && (
            <a href={event.links.linkAggregate}>
              <div className="flex items-center gap-x-2">
                <FaLink className={cn("shrink-0", iconSize)} />
                <span className="underline-offset-2 hover:underline">
                  {formatDisplayUrl(event.links.linkAggregate)}
                </span>
              </div>
            </a>
          )}
          {event.links?.instagram && (
            <a
              href={`https://www.instagram.com/${event.links.instagram.split("@").slice(-1)[0]}`}
              target="_blank"
            >
              <div className="flex items-center gap-x-2">
                <FaInstagram className={cn("shrink-0", iconSize)} />

                <span className="underline-offset-2 hover:underline">
                  {event.links.instagram.includes("@") && submitRecap
                    ? event.links.instagram.split("@").slice(-1)[0]
                    : event.links.instagram}
                </span>
              </div>
            </a>
          )}
          {event.links?.facebook && (
            <a
              href={
                event.links.facebook.includes("@")
                  ? `https://www.facebook.com/${event.links.facebook.split("@").slice(-1)[0]}`
                  : event.links.facebook
              }
              target="_blank"
            >
              <div className="flex items-center gap-x-2">
                <FaFacebookF className={cn("shrink-0", iconSize)} />

                <span className="underline-offset-2 hover:underline">
                  {/* {event.links.facebook} */}
                  {event.links.facebook.includes("@")
                    ? submitRecap
                      ? event.links.facebook.split("@").slice(-1)[0]
                      : event.links.facebook
                    : event.name}
                </span>
              </div>
            </a>
          )}
          {event.links?.threads && (
            <a
              href={`https://www.threads.com/@${event.links.threads.split("@").slice(-1)[0]}`}
              target="_blank"
            >
              <div className="flex items-center gap-x-2">
                <FaThreads className={cn("shrink-0", iconSize)} />

                <span className="underline-offset-2 hover:underline">
                  {event.links.threads}
                </span>
              </div>
            </a>
          )}
          {event.links?.vk && (
            <a
              href={`https://www.vk.com/${event.links.vk.split("@").slice(-1)[0]}`}
              target="_blank"
            >
              <div className="flex items-center gap-x-2">
                <FaVk className={cn("shrink-0", iconSize)} />

                <span className="underline-offset-2 hover:underline">
                  {event.links.vk}
                </span>
              </div>
            </a>
          )}
          {event.links?.other && !listPreview && (
            <a href={event.links.other} target="_blank">
              <div className="flex items-center gap-x-2">
                <FaPlus className={cn("shrink-0", iconSize)} />

                <span className="underline-offset-2 hover:underline">
                  {formatDisplayUrl(event.links.other)}
                </span>
              </div>
            </a>
          )}
        </div>
      )}
      {organizer &&
        organizer.links &&
        (!event || event?.links?.sameAsOrganizer === true) &&
        Object.keys(organizer.links || {}).length > 0 && (
          <div
            className={cn("flex flex-col gap-y-2 p-3", submitRecap && "p-0")}
          >
            {organizer.links?.email && (
              <a
                href={`mailto:${organizer.links.email}?subject=${organizer.name}`}
              >
                <div className="flex items-center gap-x-2">
                  <FaRegEnvelope className={cn("shrink-0", iconSize)} />
                  <span className="underline-offset-2 hover:underline">
                    {organizer.links.email}
                  </span>
                </div>
              </a>
            )}
            {organizer.links?.website && (
              <a href={organizer.links.website}>
                <div className="flex items-center gap-x-2">
                  <Globe className={cn("shrink-0", iconSize)} />
                  <span className="max-w-[30ch] truncate underline-offset-2 hover:underline">
                    {formatDisplayUrl(organizer.links.website)}
                  </span>
                </div>
              </a>
            )}
            {organizer.links?.linkAggregate && (
              <a href={organizer.links.linkAggregate}>
                <div className="flex items-center gap-x-2">
                  <FaLink className={cn("shrink-0", iconSize)} />
                  <span className="underline-offset-2 hover:underline">
                    {formatDisplayUrl(organizer.links.linkAggregate)}{" "}
                  </span>
                </div>
              </a>
            )}

            {organizer.links?.phone && (
              <a href={`tel:${organizer.links.phone}`}>
                <div className="flex items-center gap-x-2">
                  <Phone className={cn("shrink-0", iconSize)} />

                  <span className="underline-offset-2 hover:underline">
                    {organizer.links.phone}
                  </span>
                </div>
              </a>
            )}
            {organizer.links?.instagram && (
              <a
                href={`https://www.instagram.com/${organizer.links.instagram.split("@").slice(-1)[0]}`}
                target="_blank"
              >
                <div className="flex items-center gap-x-2">
                  <FaInstagram className={cn("shrink-0", iconSize)} />

                  <span className="underline-offset-2 hover:underline">
                    {organizer.links.instagram.includes("@") && submitRecap
                      ? organizer.links.instagram.split("@").slice(-1)[0]
                      : organizer.links.instagram}
                  </span>
                </div>
              </a>
            )}
            {organizer.links?.facebook && (
              <a
                href={
                  organizer.links.facebook.includes("@")
                    ? `https://www.facebook.com/${organizer.links.facebook.split("@").slice(-1)[0]}`
                    : organizer.links.facebook
                }
              >
                <div className="flex items-center gap-x-2">
                  <FaFacebookF className={cn("shrink-0", iconSize)} />

                  <span className="underline-offset-2 hover:underline">
                    {organizer.links.facebook.includes("@")
                      ? submitRecap
                        ? organizer.links.facebook.split("@").slice(-1)[0]
                        : organizer.links.facebook
                      : organizer.name}
                  </span>
                </div>
              </a>
            )}
            {organizer.links?.threads && (
              <a
                href={`https://www.threads.com/@${organizer.links.threads.split("@").slice(-1)[0]}`}
                target="_blank"
              >
                <div className="flex items-center gap-x-2">
                  <FaThreads className={cn("shrink-0", iconSize)} />

                  <span className="underline-offset-2 hover:underline">
                    @{organizer.links.threads.split(".net/").slice(-1)[0]}
                  </span>
                </div>
              </a>
            )}
            {organizer.links?.vk && (
              <a
                href={`https://www.vk.com/${organizer.links.vk.split("@").slice(-1)[0]}`}
                target="_blank"
              >
                <div className="flex items-center gap-x-2">
                  <FaVk className={cn("shrink-0", iconSize)} />

                  <span className="underline-offset-2 hover:underline">
                    @{organizer.links.vk.split(".com/").slice(-1)[0]}
                  </span>
                </div>
              </a>
            )}
          </div>
        )}
    </>
  );
};
