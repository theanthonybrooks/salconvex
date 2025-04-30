"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

import { Link } from "@/components/ui/custom-link";
import NavTabs from "@/components/ui/nav-tabs";
import { OrganizerCard } from "@/features/organizers/components/organizer-card";
import { RichTextDisplay } from "@/lib/richTextFns";
import { OrganizerCardProps } from "@/types/organizer";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";

export const OrganizerCardDetailDesktop = (props: OrganizerCardProps) => {
  const router = useRouter();
  const { data, className } = props;
  const { events, organizer } = data;
  const {
    logo: orgLogo,
    location,
    //  links
  } = organizer;

  // const { bookmarked, hidden } = artist?.listActions?.find(
  //   (la) => la.eventId === event._id,
  // ) ?? {
  //   bookmarked: false,
  //   hidden: false,
  // };

  const { locale, city, stateAbbr, country, countryAbbr } = location;

  const tabList = [
    // { id: "application", label: "My Application" },
    { id: "events", label: "Events/Projects" },
    { id: "organizer", label: "Organizer" },
  ];
  const [activeTab, setActiveTab] = useState("events");
  // const { toggleListAction } = useToggleListAction(event._id);

  const locationString = `${locale ? `${locale}, ` : ""}${city}, ${
    stateAbbr ? stateAbbr + ", " : ""
  }${countryAbbr === "UK" || countryAbbr === "USA" ? countryAbbr : country}`;

  // const orgLocationString = `${organizer.location.city}, ${
  //   organizer.location.stateAbbr ? organizer.location.stateAbbr + ", " : ""
  // }${
  //   organizer.location.countryAbbr === "UK" ||
  //   organizer.location.countryAbbr === "USA" ||
  //   organizer.location.country === "United States"
  //     ? organizer.location.countryAbbr
  //     : organizer.location.country
  // }`;

  // const onBookmark = () => {
  //   if (!artist) {
  //     router.push("/pricing");
  //   } else {
  //     // toggleListAction({ bookmarked: !bookmarked });
  //     //TODO: bookmark organizer functionality
  //   }
  // };

  const onBackClick = () => {
    const previous = sessionStorage.getItem("previousSalPage");
    if (previous && previous.startsWith("/")) {
      router.push(previous);
    } else {
      router.push("/thelist");
    }
  };

  return (
    <div
      className={cn(
        "flex w-full max-w-[min(90vw,1400px)] flex-col gap-x-6 pb-10 xl:grid xl:grid-cols-[300px_auto]",
        className,
      )}
    >
      <div
        onClick={onBackClick}
        className="col-start-1 row-span-1 mx-auto flex w-max cursor-pointer items-center justify-start gap-x-2 py-6 underline-offset-2 hover:underline"
      >
        <IoIosArrowRoundBack className="size-6" /> back to The List
      </div>

      <Card
        className={cn(
          "row-start-2 hidden w-full max-w-[350px] grid-cols-[75px_auto] gap-x-3 self-start rounded-3xl border-foreground/20 bg-white/50 p-3 first:mt-6 xl:sticky xl:top-24 xl:grid",
        )}
      >
        <div className="col-span-full mb-4 grid w-full grid-cols-[75px_auto] gap-x-3 pt-2">
          <div className="col-span-1 flex items-center justify-center">
            <Image
              src={orgLogo}
              alt="Organizer Logo"
              width={60}
              height={60}
              className={cn("size-[60px] rounded-full border-2")}
            />
          </div>

          <div className="col-start-2 row-start-1 flex items-center">
            <p className="mb-1 text-balance pr-1 text-base font-semibold">
              {organizer?.name}
            </p>
          </div>
          <div className="col-span-full row-start-2 flex flex-col justify-between gap-y-3 px-4 pt-4">
            <p className="flex flex-col items-start gap-1 text-sm">
              <span className="space-x-1 font-semibold">Location:</span>
              <span className="inline-flex items-end gap-x-1 text-sm leading-[0.95rem]">
                {locationString}

                <MapPin
                  onClick={() => setActiveTab("event")}
                  className="size-5 cursor-pointer transition-transform duration-150 hover:scale-105"
                />
              </span>
            </p>

            {/* //todo: ensure that this is required in the submission form */}
            {organizer.about && (
              <div className="flex flex-col gap-2 text-sm">
                <p className="pb-2 font-bold">About:</p>
                <RichTextDisplay html={organizer.about} />
              </div>
            )}

            {/* <div className="flex flex-col items-start gap-1 text-sm">
              <span className="font-semibold">Organized by:</span>
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
                <Image
                  src={organizer.logo}
                  alt="Event Logo"
                  width={50}
                  height={50}
                  className={cn("size-[40px] rounded-full border-2")}
                />
                <div className="col-span-1">
                  <p className="max-w-[18ch] truncate text-sm font-bold">
                    {organizer.name}
                  </p>
                  <p className="max-w-[18ch] truncate text-xs">
                    {orgLocationString}
                  </p>
                </div>
              </Card>
            </div> */}
          </div>
        </div>
      </Card>

      <Card className="col-start-2 row-start-2 flex w-full flex-col gap-y-2 rounded-3xl border-foreground/20 bg-white/50 p-4">
        <div className="flex h-20 w-full items-center gap-x-4 rounded-2xl border border-dotted border-foreground/50 bg-[#fef9dd] p-4">
          <div className="flex w-full items-center justify-between pr-2">
            <div className="flex items-center gap-x-4 px-4">
              <Image
                src={orgLogo}
                alt="Event Logo"
                width={60}
                height={60}
                className={cn("size-[60px] rounded-full border-2 xl:hidden")}
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold">{organizer?.name}</span>
                <span className="inline-flex items-end gap-x-1 text-sm leading-[0.95rem]">
                  {locationString}

                  <MapPin
                    onClick={() => setActiveTab("event")}
                    className="size-4 cursor-pointer transition-transform duration-150 hover:scale-105"
                  />
                </span>
              </div>
            </div>
            {/* <div className="flex items-center gap-x-4">
              {bookmarked ? (
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger>
                      <FaBookmark
                        className="size-7 cursor-pointer text-red-500"
                        onClick={onBookmark}
                      />
                    </TooltipTrigger>
                    <TooltipContent align="end">
                      <p>Remove Bookmark</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger>
                      <FaRegBookmark
                        className="size-7 cursor-pointer"
                        onClick={onBookmark}
                      />{" "}
                    </TooltipTrigger>
                    <TooltipContent align="end">
                      <p>Bookmark Organization</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div> */}
          </div>
        </div>
        <NavTabs
          tabs={tabList}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        >
          <div id="events">
            <ol className="list-outside list-decimal px-2">
              {events?.map((event) => (
                <li key={event._id} className="text-sm">
                  <div className="flex items-center gap-x-2">
                    <Link
                      href={`/thelist/event/${event.slug}/${event.dates.edition}`}
                      target="_blank"
                    >
                      <p className="text-sm">
                        <span className="font-bold">{event.name}</span>
                        {" - "}
                        <span className="font-light italic">
                          {event.dates.edition}
                        </span>
                      </p>
                    </Link>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div id="organizer">
            <OrganizerCard
              organizer={organizer}
              format="desktop"
              srcPage="organizer"
            />
          </div>
          <div id="application">
            <p>Application content</p>
          </div>
        </NavTabs>
      </Card>
    </div>
  );
};
