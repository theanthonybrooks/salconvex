"use client";

import { ResourceCard } from "@/app/(pages)/resources/components/resource-card";

import { Link } from "@/components/ui/custom-link";
import { cn } from "@/helpers/utilsFns";

import { api } from "~/convex/_generated/api";
import { useQuery } from "convex-helpers/react/cache/hooks";

const ResourcesPage = () => {
  const onlineEventsData = useQuery(
    api.userAddOns.onlineEvents.getPublishedOnlineEvents,
  );
  const { data: onlineEvents, success: onlineEventsSuccess } =
    onlineEventsData ?? {};

  const order = {
    published: 0,
    archived: 1,
    draft: 2,
  };
  return (
    <div
      className={cn("mx-auto mb-12 flex w-full max-w-[1300px] flex-col gap-2")}
    >
      {/* <div className={cn("mb-12 sm:mb-16")}>
        <Image
          src="/branding/about.png"
          alt="About The Street Art List"
          width={300}
          height={100}
          priority={true}
          className="[@media(max-width:724px)]:w-64"
        />
      </div> */}
      <div className={cn("mb-10 space-y-10 text-center md:mb-14")}>
        <h1 className="font-tanker text-4xl lowercase tracking-wide md:text-[4rem]">
          Resources
        </h1>
        <p>
          A collection of resources for artists and organizers - Online events,
          workshops & more
        </p>
      </div>
      <div className={cn("mx-auto w-fit space-y-8")}>
        <p className={cn("font-bold")}>Online Events</p>
        <div
          className={cn(
            "mx-auto flex flex-col gap-8 sm:flex-row sm:justify-around",
          )}
        >
          <>
            {onlineEvents ? (
              onlineEvents
                .sort((a, b) => {
                  const stateCompare = order[a.state] - order[b.state];
                  if (stateCompare !== 0) return stateCompare;
                  return b._creationTime - a._creationTime;
                })

                .map((resource) => {
                  return (
                    <ResourceCard
                      key={resource._id}
                      {...{ ...resource, type: "online" }}
                    />
                  );
                })
            ) : onlineEventsSuccess ? (
              <p>No online events found</p>
            ) : (
              <p>Loading...</p>
            )}
          </>
        </div>
      </div>
      <div className={cn("mx-auto mt-10 w-fit sm:mt-16")}>
        <p className={cn("text-center font-bold sm:text-start")}>
          If you have an idea for something more, or have a resource that
          you&apos;d like to share,{" "}
          <Link
            href="mailto:hey@thestreetartlist.com"
            className="!text-base underline"
          >
            please reach out
          </Link>
          !
        </p>
      </div>
    </div>
  );
};

export default ResourcesPage;
