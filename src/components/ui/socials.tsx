import { SOCIAL_MEDIA_LINKS } from "@/constants/links";
import { infoEmail } from "@/constants/siteInfo";

import Link from "next/link";

import { FaRegEnvelope } from "react-icons/fa6";
import { Globe } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/helpers/utilsFns";

interface SocialsRowProps {
  size?: number;
  className?: string;
  contClassName?: string;
  linktree?: boolean;
}

export default function SocialsRow({
  size = 7,
  className,
  contClassName,
  linktree,
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
      {linktree && (
        <Link href="/">
          <Button
            variant="icon"
            size="icon"
            aria-label="website link"
            className="h-auto w-auto"
          >
            <Globe className={cn(`size-${size}`, className)} />
          </Button>
        </Link>
      )}
    </div>
  );
}
