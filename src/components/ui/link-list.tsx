import { formatDisplayUrl } from "@/helpers/linkFns";
import { cn } from "@/helpers/utilsFns";
import { Globe, Phone } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLink,
  FaLinkedin,
  FaPlus,
  FaRegEnvelope,
  FaThreads,
  FaVk,
  FaYoutube,
} from "react-icons/fa6";
import { formatPhoneNumberIntl } from "react-phone-number-input";
import truncateMiddle from "truncate-middle";
import { LinksType } from "~/convex/schema";

type EventLinks = LinksType & {
  sameAsOrganizer?: boolean;
};

interface MinimalEventLinks {
  name: string;
  links?: EventLinks;
}

interface MinimalOrgLinks {
  name: string;
  links?: LinksType;
}

interface LinkListProps {
  event?: MinimalEventLinks;
  organizer?: MinimalOrgLinks;
  purpose?: string;
  fontSize?: string;
}

export const LinkList = ({
  event,
  organizer,
  purpose,
  fontSize,
}: LinkListProps) => {
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

  return (
    <>
      {((event && event.links && !submitRecap) ||
        (event &&
          event.links &&
          event.links.sameAsOrganizer !== true &&
          submitRecap)) && (
        <div
          className={cn(
            "flex flex-col gap-y-2",
            !listPreview && "p-3",
            submitRecap && "p-0",
            fontSize,
          )}
        >
          {event.links?.email && !listPreview && (
            <a href={`mailto:${event.links.email}?subject=${event.name}`}>
              <div className="flex items-center gap-x-2">
                <FaRegEnvelope className={cn("shrink-0", iconSize)} />
                <span
                  className={cn(
                    "underline-offset-2 hover:underline",
                    submitRecap && "truncate",
                  )}
                >
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
                <span
                  className={cn(
                    "underline-offset-2 hover:underline",
                    submitRecap && "truncate",
                  )}
                >
                  {formatPhoneNumberIntl(event.links.phone)}{" "}
                  {event.links.phoneExt ? `Ext: ${event.links.phoneExt}` : ""}
                </span>
              </div>
            </a>
          )}
          {event.links?.linkAggregate && !listPreview && (
            <a href={event.links.linkAggregate}>
              <div className="flex items-center gap-x-2">
                <FaLink className={cn("shrink-0", iconSize)} />
                <span
                  className={cn(
                    "underline-offset-2 hover:underline",
                    submitRecap && "truncate",
                  )}
                >
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

                <span
                  className={cn(
                    "underline-offset-2 hover:underline",
                    submitRecap && "truncate",
                  )}
                >
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

                <span
                  className={cn(
                    "underline-offset-2 hover:underline",
                    submitRecap && "truncate",
                  )}
                >
                  {/* {event.links.facebook} */}
                  {event.links.facebook.includes("@")
                    ? submitRecap
                      ? event.links.facebook.split("@").slice(-1)[0]
                      : event.links.facebook
                    : "Facebook"}
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

                <span
                  className={cn(
                    "underline-offset-2 hover:underline",
                    submitRecap && "truncate",
                  )}
                >
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

                <span
                  className={cn(
                    "underline-offset-2 hover:underline",
                    submitRecap && "truncate",
                  )}
                >
                  {event.links.vk}
                </span>
              </div>
            </a>
          )}
          {event.links?.youTube && !listPreview && (
            <a href={event.links.youTube} target="_blank">
              <div className="flex items-center gap-x-2">
                <FaYoutube className={cn("shrink-0", iconSize)} />

                <span
                  className={cn(
                    "underline-offset-2 hover:underline",
                    submitRecap && "truncate",
                  )}
                >
                  {submitRecap
                    ? truncateMiddle(event.links.youTube, 25, 5, "...")
                    : "YouTube"}
                </span>
              </div>
            </a>
          )}
          {event.links?.other && !listPreview && (
            <a href={event.links.other} target="_blank">
              <div className="flex items-center gap-x-2">
                <FaPlus className={cn("shrink-0", iconSize)} />

                <span
                  className={cn(
                    "underline-offset-2 hover:underline",
                    submitRecap && "truncate",
                  )}
                >
                  {formatDisplayUrl(event.links.other)}
                </span>
              </div>
            </a>
          )}
        </div>
      )}
      {organizer &&
        organizer.links &&
        (!submitRecap ||
          (submitRecap &&
            (!event || event?.links?.sameAsOrganizer === true))) &&
        Object.keys(organizer.links || {}).length > 0 && (
          <div
            className={cn(
              "flex flex-col gap-y-2 p-3",
              submitRecap && "p-0",
              fontSize,
            )}
          >
            {organizer.links?.email && (
              <a
                href={`mailto:${organizer.links.email}?subject=${organizer.name}`}
              >
                <div className="flex items-center gap-x-2">
                  <FaRegEnvelope className={cn("shrink-0", iconSize)} />
                  <span
                    className={cn(
                      "underline-offset-2 hover:underline",
                      submitRecap && "truncate",
                    )}
                  >
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
                  <span
                    className={cn(
                      "underline-offset-2 hover:underline",
                      submitRecap && "truncate",
                    )}
                  >
                    {formatDisplayUrl(organizer.links.linkAggregate)}{" "}
                  </span>
                </div>
              </a>
            )}

            {organizer.links?.phone && (
              <a href={`tel:${organizer.links.phone}`}>
                <div className="flex items-center gap-x-2">
                  <Phone className={cn("shrink-0", iconSize)} />

                  <span
                    className={cn(
                      "underline-offset-2 hover:underline",
                      submitRecap && "truncate",
                    )}
                  >
                    {organizer.links.phone}{" "}
                    {organizer.links.phoneExt
                      ? `Ext: ${organizer.links.phoneExt}`
                      : ""}
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

                  <span
                    className={cn(
                      "underline-offset-2 hover:underline",
                      submitRecap && "truncate",
                    )}
                  >
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

                  <span
                    className={cn(
                      "underline-offset-2 hover:underline",
                      submitRecap && "truncate",
                    )}
                  >
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

                  <span
                    className={cn(
                      "underline-offset-2 hover:underline",
                      submitRecap && "truncate",
                    )}
                  >
                    {organizer.links.threads}
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

                  <span
                    className={cn(
                      "underline-offset-2 hover:underline",
                      submitRecap && "truncate",
                    )}
                  >
                    @{organizer.links.vk.split(".com/").slice(-1)[0]}
                  </span>
                </div>
              </a>
            )}
            {organizer.links?.youTube && (
              <a
                href={
                  organizer.links.youTube.includes("https://")
                    ? organizer.links.youTube
                    : `https://${organizer.links.youTube}`
                }
                target="_blank"
              >
                <div className="flex items-center gap-x-2">
                  <FaYoutube className={cn("shrink-0", iconSize)} />

                  <span
                    className={cn(
                      "max-w-[35ch] truncate underline-offset-2 hover:underline",
                      submitRecap && "truncate",
                    )}
                  >
                    {submitRecap
                      ? truncateMiddle(organizer.links.youTube, 25, 5, "...")
                      : "YouTube"}{" "}
                  </span>
                </div>
              </a>
            )}
            {organizer.links.linkedIn && (
              <a href={organizer.links.linkedIn} target="_blank">
                <div className="flex items-center gap-x-2">
                  <FaLinkedin className="size-4 shrink-0" />
                  <span
                    className={cn(
                      "underline-offset-2 hover:underline",
                      submitRecap && "truncate",
                    )}
                  >
                    {submitRecap
                      ? truncateMiddle(organizer.links.linkedIn, 25, 5, "...")
                      : "LinkedIn"}
                  </span>
                </div>
              </a>
            )}
          </div>
        )}
    </>
  );
};
