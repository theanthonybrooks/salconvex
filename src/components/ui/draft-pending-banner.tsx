import { Link } from "@/components/ui/custom-link";
import { SubmissionFormState as EventState } from "@/types/eventTypes";
import { OpenCallState } from "@/types/openCallTypes";
import { Id } from "~/convex/_generated/dataModel";

interface DraftPendingBannerProps {
  format: "desktop" | "mobile";
  openCallState?: OpenCallState;
  eventState?: EventState;
  eventId: Id<"events">;
}

export const DraftPendingBanner = ({
  format,

  openCallState,
  eventState,
  eventId,
}: DraftPendingBannerProps) => {
  const isMobile = format === "mobile";
  const hasDraft = eventState === "draft";
  const hasPendingState =
    eventState === "submitted" ||
    openCallState === "pending" ||
    openCallState === "submitted";

  return (
    <>
      {isMobile ? (
        <>
          {(hasDraft || hasPendingState) && (
            <div className="col-span-full mb-4 w-full text-center">
              {hasDraft && !hasPendingState && (
                <p className="rounded-lg border-2 bg-stone-100 p-4 text-2xl font-bold uppercase text-foreground/60">
                  Draft - Preview Only
                </p>
              )}
              {hasPendingState && (
                <p className="rounded-lg border-2 bg-salYellow/70 p-4 text-2xl font-bold uppercase text-foreground/60">
                  Pending - Preview Only
                </p>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          {hasDraft && (
            <p className="mb-4 w-full rounded-lg border-2 bg-stone-100 p-4 text-center text-2xl font-bold uppercase text-foreground/60">
              Draft - Preview Only
            </p>
          )}
          {hasPendingState && (
            <div className="mb-4 flex w-full flex-col items-center justify-center gap-y-2 rounded-lg border-2 bg-salYellow/70 p-4 text-foreground/60">
              <p className="text-2xl font-bold uppercase">
                Pending - Preview Only
              </p>
              {openCallState === "pending" && (
                <span className="text-center">
                  This open call is not yet submitted. You can still preview it,
                  but{" "}
                  {`${eventState === "published" ? "only the event/project will" : eventState === "submitted" ? "it will not" : null}`}{" "}
                  be listed to the public. Submit via the{" "}
                  <Link
                    variant="bold"
                    href={`/dashboard/organizer/update-event?_id=${eventId}`}
                    target="_blank"
                    className="underline-offset-2 lg:text-base"
                  >
                    dashboard
                  </Link>
                  .
                </span>
              )}
              {openCallState !== "pending" && (
                <span className="text-center">
                  Until it&apos;s approved,{" "}
                  {`${eventState === "published" ? "only the event/project will" : eventState === "submitted" ? "it will not" : null}`}{" "}
                  be listed to the public. You can still update it via the{" "}
                  <Link
                    variant="bold"
                    href={`/dashboard/organizer/update-event?_id=${eventId}`}
                    target="_blank"
                    className="underline-offset-2 lg:text-base"
                  >
                    dashboard
                  </Link>
                  .
                </span>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
};
