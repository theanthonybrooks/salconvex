import Link from "next/link";
import { FaRegEnvelope } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { cn } from "@/helpers/utilsFns";
import { SOCIAL_MEDIA_LINKS } from "@/constants/links";
import { infoEmail } from "@/constants/siteInfo";

interface SocialsRowProps {
  size?: number;
  className?: string;
  contClassName?: string;
}

export default function SocialsRow({
  size = 7,
  className,
  contClassName,
}: SocialsRowProps) {
  return (
    <div
      className={cn("flex items-center justify-center gap-6", contClassName)}
    >
      {SOCIAL_MEDIA_LINKS.map(({ label, icon: Icon, path }) => (
        <Link href={path} key={label} target="_blank">
          <Button
            variant="icon"
            size="icon"
            aria-label={label}
            className="h-auto w-auto"
          >
            <Icon className={cn(`size-${size}`, className)} />
          </Button>
        </Link>
      ))}

      <Link href={`mailto:${infoEmail}`}>
        <Button
          variant="icon"
          size="icon"
          aria-label="email link"
          className="h-auto w-auto"
        >
          <FaRegEnvelope className={cn(`size-${size}`, className)} />
        </Button>
      </Link>
    </div>
  );
}
