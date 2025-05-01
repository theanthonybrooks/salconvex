import { Card } from "@/components/ui/card";
import { formatDisplayUrl } from "@/lib/linkFns";
import { RichTextDisplay } from "@/lib/richTextFns";
import { cn } from "@/lib/utils";
import { Organizer } from "@/types/organizer";
import { Globe, Phone } from "lucide-react";
import Image from "next/image";
import {
  FaEnvelope,
  FaFacebook,
  FaFacebookF,
  FaInstagram,
  FaLink,
  FaThreads,
  FaVk,
} from "react-icons/fa6";
import { TiArrowRight } from "react-icons/ti";
import { formatPhoneNumberIntl } from "react-phone-number-input";
import slugify from "slugify";

interface OrganizerCardProps {
  organizer: Organizer;
  format?: string;
  srcPage?: string;
}

export const OrganizerCard = ({
  organizer,
  format,
  srcPage,
}: OrganizerCardProps) => {
  const orgLocationString = `${
    organizer.location.locale ? `${organizer.location.locale}, ` : ""
  }${organizer.location.city ? organizer.location.city + "," : ""} ${
    organizer.location.city && organizer.location.stateAbbr
      ? organizer.location.stateAbbr + ", "
      : ""
  }${
    !organizer.location.city && organizer.location.state
      ? organizer.location.state + ", "
      : ""
  }${
    organizer.location.countryAbbr === "UK" ||
    organizer.location.countryAbbr === "USA" ||
    organizer.location.country === "United States"
      ? organizer.location.countryAbbr
      : organizer.location.country
  }`;
  const orgHasOtherEvents = organizer?.events?.length > 1;
  const orgSlug = slugify(organizer.name);
  const isMobile = format === "mobile";
  const orgPage = srcPage === "organizer";

  const primaryContact = organizer?.contact?.primaryContact;

  return (
    <>
      {isMobile ? (
        <Card className="w-full max-w-full space-y-6 overflow-hidden rounded-xl border-foreground/20 bg-white/60 p-5">
          <div className="grid w-full grid-cols-[75px_minmax(0,1fr)] items-center">
            <Image
              src={organizer.logo}
              alt="Event Logo"
              width={60}
              height={60}
              className={cn("size-[60px] rounded-full border-2")}
            />
            <div className="col-span-1">
              <p className="line-clamp-2 text-sm font-bold">{organizer.name}</p>
              <p className="text-sm font-medium">{orgLocationString}</p>
            </div>
          </div>
          <div className="w-full space-y-5">
            {organizer.about && (
              <section>
                <p className="text-sm font-semibold">About the Organization:</p>
                <RichTextDisplay
                  html={organizer.about}
                  className="line-clamp-4 text-sm"
                />
              </section>
            )}
            <section className="flex flex-col gap-y-2">
              {organizer.contact?.organizer && (
                <span>
                  <p className="text-sm font-semibold">Organizer:</p>
                  <p className="line-clamp-4 text-sm">
                    {organizer.contact.organizer}
                  </p>
                </span>
              )}
              <span>
                <p className="text-sm font-semibold">Main Contact:</p>
                <div className="flex items-center gap-x-2">
                  {primaryContact === "email" ? (
                    <FaEnvelope />
                  ) : primaryContact === "phone" ? (
                    <Phone />
                  ) : primaryContact === "facebook" ? (
                    <FaFacebookF />
                  ) : primaryContact === "instagram" ? (
                    <FaInstagram />
                  ) : primaryContact === "threads" ? (
                    <FaThreads />
                  ) : primaryContact === "vk" ? (
                    <FaVk />
                  ) : (
                    <Globe />
                  )}

                  <a
                    href={
                      primaryContact === "email"
                        ? `mailto:${organizer.links.email}`
                        : primaryContact === "website"
                          ? organizer.links.website
                          : primaryContact === "phone"
                            ? `tel:${organizer.links.phone}`
                            : primaryContact === "facebook"
                              ? organizer.links.facebook
                              : primaryContact === "instagram"
                                ? organizer.links.instagram
                                : primaryContact === "threads"
                                  ? organizer.links.threads
                                  : organizer.links.vk
                    }
                    className="line-clamp-4 text-sm underline-offset-2 hover:underline"
                  >
                    {primaryContact === "phone"
                      ? formatPhoneNumberIntl(organizer.links.phone as string)
                      : primaryContact === "website"
                        ? formatDisplayUrl(organizer.links.website as string)
                        : primaryContact === "email"
                          ? organizer.links.email
                          : primaryContact === "facebook"
                            ? organizer.links.facebook
                            : primaryContact === "instagram"
                              ? organizer.links.instagram
                              : primaryContact === "threads"
                                ? organizer.links.threads
                                : organizer.links.vk}
                  </a>
                </div>
              </span>
            </section>
            <section>
              <p className="text-sm font-semibold">Links:</p>
              <div className="flex items-center justify-start gap-x-6 pt-3">
                {organizer.links?.website && (
                  <a
                    href={organizer.links.website}
                    className="h-6 w-6 hover:scale-110"
                  >
                    <Globe className="h-6 w-6" />
                  </a>
                )}
                {organizer.links?.email && (
                  <a
                    href={`mailto:${organizer.links.email}`}
                    className="h-6 w-6 hover:scale-110"
                  >
                    <FaEnvelope className="h-6 w-6" />
                  </a>
                )}
                {organizer.links?.phone && (
                  <a
                    href={`tel:${organizer.links.phone}`}
                    className="h-6 w-6 hover:scale-110"
                  >
                    <Phone className="h-6 w-6" />
                  </a>
                )}
                {organizer.links?.linkAggregate && (
                  <a
                    href={organizer.links.linkAggregate}
                    className="size-6 hover:scale-110"
                  >
                    <FaLink className="size-6" />
                  </a>
                )}
                {organizer.links?.instagram && (
                  <a
                    href={organizer.links.instagram}
                    className="h-6 w-6 hover:scale-110"
                  >
                    <FaInstagram className="h-6 w-6" />
                  </a>
                )}
                {organizer.links?.facebook && (
                  <a
                    href={organizer.links.facebook}
                    className="h-6 w-6 hover:scale-110"
                  >
                    <FaFacebook className="h-6 w-6" />
                  </a>
                )}
                {organizer.links?.threads && (
                  <a
                    href={organizer.links.threads}
                    className="h-6 w-6 hover:scale-110"
                  >
                    <FaThreads className="h-6 w-6" />
                  </a>
                )}
                {organizer.links?.vk && (
                  <a
                    href={organizer.links.vk}
                    className="h-6 w-6 hover:scale-110"
                  >
                    <FaVk className="h-6 w-6" />
                  </a>
                )}
              </div>
              {!orgPage && (
                <a
                  className="mt-6 line-clamp-4 text-center text-sm underline-offset-2 hover:underline"
                  href={`/thelist/organizer/${orgSlug}`}
                  target="_blank"
                >
                  Check out {organizer.name}&apos;s other events
                </a>
              )}
            </section>
          </div>

          {/* <div className='col-span-full'>
                      <h3>Other Events/Projects by this organizer:</h3>
                      <ul>
                        <li>
                          Event Name <Link href='#'>(link)</Link>
                        </li>
                        <li>
                          Event Name <Link href='#'>(link)</Link>
                        </li>
                      </ul>
                    </div> */}
        </Card>
      ) : (
        <Card className="grid w-full max-w-full grid-cols-2 space-y-6 divide-x-2 divide-dotted divide-foreground/20 overflow-hidden rounded-xl border-2 border-dotted border-foreground/20 bg-white/30 p-5">
          <div className="w-full space-y-5 divide-y-2 divide-dotted divide-foreground/20">
            <div className="grid w-full grid-cols-[60px_minmax(0,1fr)] items-center">
              <Image
                src={organizer.logo}
                alt="Event Logo"
                width={50}
                height={50}
                className={cn("size-[50px] rounded-full border-2")}
              />
              <div className="col-span-1">
                <p className="line-clamp-2 text-sm font-bold">
                  {organizer.name}
                </p>
                <p className="text-sm">{orgLocationString}</p>
              </div>
            </div>

            <div className="flex flex-col gap-y-2 pt-4">
              <section className="flex flex-col gap-y-2">
                {organizer.contact?.organizer && (
                  <span>
                    <p className="text-sm font-semibold">Organizer:</p>
                    <p className="line-clamp-4 text-sm">
                      {organizer.contact.organizer}
                    </p>
                  </span>
                )}
                <span>
                  <p className="text-sm font-semibold">Main Contact:</p>
                  {/* <div className="flex items-center gap-x-2">
                    {organizer.contact.primaryContact.email ? (
                      <FaEnvelope />
                    ) : organizer.contact.primaryContact.phone ? (
                      <Phone />
                    ) : (
                      <Globe />
                    )}

                    <a
                      href={
                        organizer.contact.primaryContact.email
                          ? `mailto:${organizer.contact.primaryContact.email}`
                          : organizer.contact.primaryContact.href
                            ? organizer.contact.primaryContact.href
                            : `tel:${organizer.contact.primaryContact.phone}`
                      }
                      className="line-clamp-4 text-sm underline-offset-2 hover:underline"
                    >
                      {organizer.contact.primaryContact.phone
                        ? organizer.contact.primaryContact.phone
                        : organizer.contact.primaryContact.href
                          ? organizer.contact.primaryContact.href
                          : organizer.contact.primaryContact.email}
                    </a>
                  </div> */}
                  <div className="flex items-center gap-x-2">
                    {primaryContact === "email" ? (
                      <FaEnvelope />
                    ) : primaryContact === "phone" ? (
                      <Phone />
                    ) : primaryContact === "facebook" ? (
                      <FaFacebookF />
                    ) : primaryContact === "instagram" ? (
                      <FaInstagram />
                    ) : primaryContact === "threads" ? (
                      <FaThreads />
                    ) : primaryContact === "vk" ? (
                      <FaVk />
                    ) : (
                      <Globe />
                    )}

                    <a
                      href={
                        primaryContact === "email"
                          ? `mailto:${organizer.links.email}`
                          : primaryContact === "website"
                            ? organizer.links.website
                            : primaryContact === "phone"
                              ? `tel:${organizer.links.phone}`
                              : primaryContact === "facebook"
                                ? organizer.links.facebook
                                : primaryContact === "instagram"
                                  ? organizer.links.instagram
                                  : primaryContact === "threads"
                                    ? organizer.links.threads
                                    : organizer.links.vk
                      }
                      className="line-clamp-4 text-sm underline-offset-2 hover:underline"
                    >
                      {primaryContact === "phone"
                        ? formatPhoneNumberIntl(organizer.links.phone as string)
                        : primaryContact === "website"
                          ? formatDisplayUrl(organizer.links.website as string)
                          : primaryContact === "email"
                            ? organizer.links.email
                            : primaryContact === "facebook"
                              ? organizer.links.facebook
                              : primaryContact === "instagram"
                                ? organizer.links.instagram
                                : primaryContact === "threads"
                                  ? organizer.links.threads
                                  : organizer.links.vk}
                    </a>
                  </div>
                </span>
              </section>
              <section>
                <p className="text-sm font-semibold">Links:</p>
                <div className="flex items-center justify-start gap-x-6 pt-3">
                  {organizer.links.website && (
                    <a
                      href={organizer.links.website}
                      className="size-6 hover:scale-110"
                    >
                      <Globe className="size-6" />
                    </a>
                  )}
                  {organizer.links.email && (
                    <a
                      href={`mailto:${organizer.links.email}`}
                      className="size-6 hover:scale-110"
                    >
                      <FaEnvelope className="size-6" />
                    </a>
                  )}
                  {organizer.links.phone && (
                    <a
                      href={`tel:${organizer.links.phone}`}
                      className="size-6 hover:scale-110"
                    >
                      <Phone className="size-6" />
                    </a>
                  )}
                  {organizer.links.instagram && (
                    <a
                      href={organizer.links.instagram}
                      className="size-6 hover:scale-110"
                    >
                      <FaInstagram className="size-6" />
                    </a>
                  )}
                  {organizer.links.facebook && (
                    <a
                      href={organizer.links.facebook}
                      className="size-6 hover:scale-110"
                    >
                      <FaFacebook className="size-6" />
                    </a>
                  )}
                  {organizer.links.threads && (
                    <a
                      href={organizer.links.threads}
                      className="size-6 hover:scale-110"
                    >
                      <FaThreads className="size-6" />
                    </a>
                  )}
                  {organizer.links.vk && (
                    <a
                      href={organizer.links.vk}
                      className="size-6 hover:scale-110"
                    >
                      <FaVk className="size-6" />
                    </a>
                  )}
                </div>
              </section>
            </div>
          </div>
          <section className="flex flex-col justify-between pl-10">
            {organizer.about && (
              <span>
                <p className="text-sm font-semibold">About the Organization:</p>

                <RichTextDisplay html={organizer.about} className="text-sm" />
              </span>
            )}
            {orgHasOtherEvents && !orgPage && (
              <a
                className="mt-6 line-clamp-4 flex items-center justify-center gap-1 text-sm underline-offset-2 hover:underline"
                href={`/thelist/organizer/${orgSlug}`}
                target="_blank"
              >
                Check out other events by this organizer
                <TiArrowRight className="inline-block size-6" />
                {/* Check out {organizer.name}&apos;s other events */}
              </a>
            )}
          </section>
        </Card>
      )}
    </>
  );
};
