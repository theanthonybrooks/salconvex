import { Card } from "@/components/ui/card";
import { OrganizerLinks } from "@/features/organizers/components/organizer-links";
import { OrganizerCardLogoName } from "@/features/organizers/components/organizer-logo-name-card";
import { OrganizerMainContact } from "@/features/organizers/components/organizer-main-contact";
import { RichTextDisplay } from "@/lib/richTextFns";
import { cn } from "@/lib/utils";
import { Organizer } from "@/types/organizer";
import { RefObject } from "react";
import { TiArrowRight } from "react-icons/ti";
import slugify from "slugify";

interface OrganizerCardProps {
  organizer: Organizer;
  format?: string;
  srcPage?: string;
  aboutRef?: RefObject<HTMLDivElement | null>;
  fontSize?: "text-sm" | "text-base";
}

export const OrganizerCard = ({
  organizer,
  format,
  srcPage,
  aboutRef,
  fontSize = "text-sm",
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
          <OrganizerCardLogoName organizer={organizer} fontSize={fontSize} />
          <div className="w-full space-y-5">
            {organizer.about && (
              <section>
                <p className={cn("font-semibold", fontSize)}>
                  About the Organization:
                </p>
                <RichTextDisplay html={organizer.about} fontSize={fontSize} />
              </section>
            )}
            <section className="flex flex-col gap-y-2 border-b-2 border-dotted border-foreground/20 pb-3">
              {organizer.contact?.organizer && (
                <span className={cn(fontSize)}>
                  <p className="font-semibold">Organizer:</p>
                  <p className="line-clamp-4">{organizer.contact.organizer}</p>
                </span>
              )}

              <OrganizerMainContact organizer={organizer} fontSize={fontSize} />
            </section>
            <OrganizerLinks organizer={organizer} fontSize={fontSize} />
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
          className={cn(
            "grid w-full max-w-full grid-cols-2 space-y-6 divide-x-2 divide-dotted divide-foreground/20 overflow-hidden rounded-xl border-2 border-dotted border-foreground/20 bg-white/30 p-5",
            fontSize,
          )}
          ref={aboutRef}
        >
          <div className="w-full space-y-5 divide-y-2 divide-dotted divide-foreground/20">
            <OrganizerCardLogoName
              organizer={organizer}
              format="desktop"
              fontSize={fontSize}
            />

            <div className="flex flex-col gap-y-2 pt-4">
              <section className="flex flex-col gap-y-2 border-b-2 border-dotted border-foreground/20 pb-3">
                {organizer.contact?.organizer && (
                  <span>
                    <p className="font-semibold">Organizer:</p>
                    <p className="line-clamp-4">
                      {organizer.contact.organizer}
                    </p>
                  </span>
                )}
                <OrganizerMainContact
                  organizer={organizer}
                  fontSize={fontSize}
                />
              </section>

              <OrganizerLinks organizer={organizer} />
            </div>
          </div>
          <section className="flex flex-col justify-between pl-10">
            {organizer.about && (
              <span>
                <p className="font-semibold">About the Organization:</p>

                <RichTextDisplay html={organizer.about} fontSize={fontSize} />
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
