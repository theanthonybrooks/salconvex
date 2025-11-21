import type { OnlineEventType } from "@/types/resourceTypes";

import Image from "next/image";
import { capitalize } from "lodash";

import { MdComputer } from "react-icons/md";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Link } from "@/components/ui/custom-link";
import { Separator } from "@/components/ui/separator";
import { TooltipSimple } from "@/components/ui/tooltip";
import { capitalizeWords } from "@/helpers/stylingFns";
import { cn } from "@/helpers/utilsFns";

export type ResourceCardProps = Pick<
  OnlineEventType,
  | "name"
  | "slug"
  | "img"
  | "price"
  | "capacity"
  | "location"
  | "startDate"
  | "endDate"
  | "regDeadline"
  | "_creationTime"
> & {
  type: "online" | "other";
};

export const ResourceCard = ({
  name,
  slug,
  img,
  price,
  capacity,
  location,
  startDate: startDateNum,
  endDate: endDateNum,
  regDeadline: regDeadlineNum,
  _creationTime: createdAt,
  type,
}: ResourceCardProps) => {
  const { max, current } = capacity;
  const now = Date.now();
  const fullWarning = max - current <= 3;
  const full = max === current;
  const newEvent = createdAt > now - 1000 * 60 * 60 * 24 * 7;
  const regPast = now > regDeadlineNum;
  const startDate = new Date(startDateNum);
  const endDate = new Date(endDateNum);
  const datePart = startDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
  });

  const timePart = startDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const endDatePart = endDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
  });
  const endTimePart = endDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  const endDateOutput =
    endDatePart === datePart ? endTimePart : `${endDatePart} @ ${endTimePart}`;
  const dateOutput = `${datePart} @ ${timePart} - ${endDateOutput}`;
  const eventHasPassed = now > endDateNum;

  return (
    <Card
      className={cn(
        "pricing-card mx-auto flex w-full min-w-[min(22vw,320px)] max-w-80 flex-col justify-between border-2 p-6 transition-opacity duration-200 ease-in-out lg:mx-0",
      )}
    >
      <div className={cn("flex items-center justify-between")}>
        <CardBadge
          fullWarning={fullWarning}
          full={full}
          newEvent={newEvent}
          past={eventHasPassed}
          regPast={regPast}
        />
        {type === "online" && (
          <TooltipSimple content="Online Event">
            <MdComputer className="size-5 shrink-0" />
          </TooltipSimple>
        )}
      </div>
      <CardHeader className="flex items-center justify-center px-0 pb-0">
        {img ? (
          <Image
            src={img}
            alt={name}
            width={225}
            height={100}
            className="h-25 w-auto"
          />
        ) : (
          <h1
            className={cn(
              "h-25 content-center text-center font-tanker text-[2.5rem] lowercase leading-none tracking-wide",
            )}
          >
            {name}
          </h1>
        )}
      </CardHeader>
      <Separator className="mx-auto my-4" thickness={2} />
      <CardDescription className="space-y-1.5 text-foreground">
        <p>{dateOutput}</p>
        <p>
          {capitalize(type)} - {capitalizeWords(location)}
        </p>
        <p>
          Price is <strong>${price.toLocaleString()}</strong>. Members can join
          for free*{" "}
        </p>
      </CardDescription>
      <CardFooter className="mt-6 p-0">
        <Link
          href={`/resources/${slug}`}
          target="_blank"
          className={cn("flex w-full items-center")}
        >
          <Button
            variant="salWithShadowHidden"
            className="mx-auto w-full max-w-50"
          >
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
type CardBadgeProps = {
  fullWarning: boolean;
  full: boolean;
  newEvent: boolean;
  past: boolean;
  regPast: boolean;
};

const CardBadge = ({
  fullWarning,
  full,
  newEvent,
  past,
  regPast,
}: CardBadgeProps) => {
  let label: string | null = null;
  let style = "";

  if (past) {
    label = "Ended";
    style = "bg-foreground/10";
  } else if ((full || fullWarning) && !regPast) {
    label = full ? "Fully Booked" : "Almost Full";
    style = "bg-salPinkLt";
  } else if (newEvent) {
    label = "New Event";
    style = "bg-salYellow";
  }

  if (!label) return <div className="flex items-center gap-1.5" />;

  return (
    <div className="flex items-center gap-1.5">
      <div className={cn("rounded-lg px-4 py-1 text-xs font-semibold", style)}>
        {label}
      </div>
    </div>
  );
};
