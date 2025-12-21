import type { ReactNode } from "react";
import type { IconType } from "react-icons";

import { useState } from "react";
import { useIsMobile } from "@/hooks/use-media-query";

import { ChevronDown, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/helpers/utilsFns";

type SectionItemProps = {
  className?: string;
  icon?: IconType;
  title: string;
  description?: string;
  descriptionNode?: ReactNode;
  fontSize?: string;
  children: ReactNode;
  disabled?: boolean;
  comingSoon?: boolean;
  subTitle?: string;
  type?: "toggle" | "general";
};

export const SectionItem = ({
  className,
  icon,
  title,
  description,
  descriptionNode,
  fontSize,
  disabled,
  comingSoon,
  subTitle,
  type = "general",
  children,
}: SectionItemProps) => {
  const isMobile = useIsMobile();
  const isToggle = type === "toggle";

  const Icon = icon;
  return (
    <div
      className={cn(
        "flex flex-col items-start justify-start gap-y-2 sm:px-3 md:flex-row md:items-center md:justify-between md:gap-y-0",
        isToggle && isMobile && "w-full flex-row justify-between py-1",
        className,
        disabled && "pointer-events-none opacity-40",
      )}
    >
      <div className={cn("flex items-center gap-4", fontSize)}>
        {Icon && <Icon className="size-5 shrink-0 text-muted-foreground" />}
        <div>
          <Label
            className={cn(
              "flex flex-col items-baseline gap-1 sm:flex-row",
              fontSize,
            )}
          >
            {title}
            {comingSoon && <p className="text-xs italic">(*coming soon)</p>}
            {subTitle && !isMobile && (
              <p className="text-xs italic">(*{subTitle})</p>
            )}
          </Label>
          {!isMobile && (
            <>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
              {descriptionNode && descriptionNode}
            </>
          )}
        </div>
      </div>
      {children}
    </div>
  );
};

type SectionGroupProps = {
  group?: {
    groupClassName?: string;
    sectionToggleAction?: (checked: boolean) => void;

    sectionToggleValue?: boolean;
    separator?: boolean;
  };
} & SectionItemProps;

export const SectionGroup = (props: SectionGroupProps) => {
  const { children, group, className, title, icon, ...rest } = props;
  const {
    groupClassName,
    sectionToggleAction,
    sectionToggleValue,
    separator = true,
  } = group ?? {};
  const [expanded, setExpanded] = useState(false);
  const isMobile = useIsMobile();
  const Icon = icon;
  const ExpandedIcon = expanded ? ChevronDown : ChevronRight;
  return (
    <>
      {separator && <Separator />}
      {isMobile ? (
        <div
          className="flex items-center justify-between"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-x-2">
            {Icon && <Icon className="size-5 shrink-0 text-muted-foreground" />}
            <Label className="text-sm font-medium leading-none">{title}</Label>
          </div>
          <div className="flex h-9 items-center justify-center px-2">
            <ExpandedIcon className="size-5 shrink-0" />
          </div>
        </div>
      ) : (
        <SectionItem
          title={title}
          icon={icon}
          {...rest}
          className={cn(className)}
        >
          <div className="flex items-center justify-end gap-x-2">
            <Button
              variant="link"
              onClick={() => setExpanded(!expanded)}
              size="sm"
            >
              View {expanded ? "Less" : "More"}
            </Button>
            {sectionToggleAction && (
              <Switch
                checked={sectionToggleValue}
                onCheckedChange={sectionToggleAction}
              />
            )}
          </div>
        </SectionItem>
      )}
      {expanded && (
        <div className={cn("space-y-4 pl-6 sm:pl-10", groupClassName)}>
          {children}
        </div>
      )}
    </>
  );
};
