import { Card } from "@/components/ui/card";
import { OrganizerLinks } from "@/features/organizers/components/organizer-links";
import { OrganizerCardLogoName } from "@/features/organizers/components/organizer-logo-name-card";
import { OrganizerMainContact } from "@/features/organizers/components/organizer-main-contact";
import { RichTextDisplay } from "@/lib/richTextFns";
import { Organizer } from "@/types/organizer";
import { RefObject } from "react";
import { TiArrowRight } from "react-icons/ti";
import slugify from "slugify";

interface OrganizerCardProps {
  organizer: Organizer;
  format?: string;
  srcPage?: string;
  aboutRef?: RefObject<HTMLDivElement | null>;
}

export const OrganizerCard = ({
  organizer,
  format,
  srcPage,
  aboutRef,
}: OrganizerCardProps) => {
  const orgHasOtherEvents = organizer?.events?.length > 1;
  const orgSlug =
    organizer?.slug ?? slugify(organizer.name, { lower: true, strict: true });
  const isMobile = format === "mobile";
  const orgPage = srcPage === "organizer";

  return (
    <>
      {isMobile ? (
        <Card className="w-full max-w-full space-y-6 overflow-hidden rounded-xl border-foreground/20 bg-white/60 p-5">
          <OrganizerCardLogoName organizer={organizer} />
          <div className="w-full space-y-5">
            {organizer.about && (
              <section>
                <p className="text-sm font-semibold">About the Organization:</p>
                <RichTextDisplay html={organizer.about} className="text-sm" />
              </section>
            )}
            <section className="flex flex-col gap-y-2 border-b-2 border-dotted border-foreground/20 pb-3">
              {organizer.contact?.organizer && (
                <span>
                  <p className="text-sm font-semibold">Organizer:</p>
                  <p className="line-clamp-4 text-sm">
                    {organizer.contact.organizer}
                  </p>
                </span>
              )}

              <OrganizerMainContact organizer={organizer} />
            </section>
            <OrganizerLinks organizer={organizer} />
            {!orgPage && (
              <a
                className="mt-6 line-clamp-4 text-center text-sm underline-offset-2 hover:underline"
                href={`/thelist/organizer/${orgSlug}`}
              >
                Check out other events by this organizer
                {/* Check out {organizer.name}&apos;s other events */}
              </a>
            )}
          </div>
        </Card>
      ) : (
        <Card
          className="grid w-full max-w-full grid-cols-2 space-y-6 divide-x-2 divide-dotted divide-foreground/20 overflow-hidden rounded-xl border-2 border-dotted border-foreground/20 bg-white/30 p-5"
          ref={aboutRef}
        >
          <div className="w-full space-y-5 divide-y-2 divide-dotted divide-foreground/20">
            <OrganizerCardLogoName organizer={organizer} format="desktop" />

            <div className="flex flex-col gap-y-2 pt-4">
              <section className="flex flex-col gap-y-2 border-b-2 border-dotted border-foreground/20 pb-3">
                {organizer.contact?.organizer && (
                  <span>
                    <p className="text-sm font-semibold">Organizer:</p>
                    <p className="line-clamp-4 text-sm">
                      {organizer.contact.organizer}
                    </p>
                  </span>
                )}
                <OrganizerMainContact organizer={organizer} />
              </section>

              <OrganizerLinks organizer={organizer} />
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
