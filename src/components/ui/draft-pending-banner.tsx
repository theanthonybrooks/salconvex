import { Link } from "@/components/ui/custom-link";
import { Separator } from "@/components/ui/separator";
import { Id } from "~/convex/_generated/dataModel";

interface DraftPendingBannerProps {
  format: "desktop" | "mobile";
  openCallState?:
    | "draft"
    | "editing"
    | "submitted"
    | "pending"
    | "published"
    | "archived";
  eventState?: "draft" | "editing" | "submitted" | "published" | "archived";
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
              {hasDraft && (
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
            <>
              <Separator
                orientation="vertical"
                className="mr-2 h-10 bg-foreground"
                thickness={2}
              />
              <p className="rounded-lg border-2 bg-stone-100 p-4 text-2xl font-bold uppercase text-foreground/60">
                Draft - Preview Only
              </p>
            </>
          )}
          {hasPendingState && (
            <>
              <Separator
                orientation="vertical"
                className="mr-2 h-10 bg-foreground"
                thickness={2}
              />
              <div className="flex max-w-lg flex-col items-center justify-center gap-y-2 rounded-lg border-2 bg-salYellow/70 p-4 text-foreground/60">
                <p className="text-2xl font-bold uppercase">
                  Pending - Preview Only
                </p>
                <span className="text-center">
                  This event is not yet submitted. You can still preview it, but
                  it will not be listed to the public. Submit via the{" "}
                  <Link
                    variant="bold"
                    href={`/dashboard/organizer/update-event?_id=${eventId}`}
                    target="_blank"
                  >
                    dashboard
                  </Link>
                  .
                </span>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
};
