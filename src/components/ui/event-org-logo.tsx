import { useState } from "react";
import Image from "next/image";

import { capitalize, cn } from "@/helpers/utilsFns";

interface EventOrgLogoProps {
  imgSrc: string;
  type?: "event" | "organizer";
  size?: "small" | "medium" | "large";
  className?: string;
}

const fallbackImg = "/1.jpg";

export const EventOrgLogo = ({
  imgSrc = "/1.jpg",
  type = "event",
  size = "medium",
  className,
}: EventOrgLogoProps) => {
  const [imgError, setImgError] = useState(false);

  const sizeVal = size === "small" ? 40 : size === "large" ? 80 : 60;
  const sizeClass =
    size === "small" ? "size-10" : size === "large" ? "size-20" : "size-15";

  return (
    <Image
      src={imgError ? fallbackImg : imgSrc}
      alt={`${capitalize(type)} Logo`}
      width={sizeVal}
      height={sizeVal}
      className={cn(
        "rounded-full border-2 border-foreground",
        size === "small" && "border-1.5",
        sizeClass,
        className,
      )}
      onError={() => setImgError(true)}
    />
  );
};
