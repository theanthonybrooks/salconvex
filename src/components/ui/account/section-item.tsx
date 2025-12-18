import type { ReactNode } from "react";
import type { IconType } from "react-icons";

import { useState } from "react";

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
  children,
}: SectionItemProps) => {
  const Icon = icon;
  return (
    <div
      className={cn(
        "flex flex-col items-start justify-start gap-y-2 px-3 md:flex-row md:items-center md:justify-between md:gap-y-0",
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
          </Label>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {descriptionNode && descriptionNode}
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
  const { children, group, className, ...rest } = props;
  const {
    groupClassName,
    sectionToggleAction,
    sectionToggleValue,
    separator = true,
  } = group ?? {};
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      {separator && <Separator />}
      <SectionItem {...rest} className={cn(className)}>
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
      {expanded && (
        <div className={cn("space-y-4 pl-6 sm:pl-10", groupClassName)}>
          {children}
        </div>
      )}
    </>
  );
};
