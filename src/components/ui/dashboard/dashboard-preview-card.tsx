"use client";

import { useDashboard } from "@/app/(pages)/dashboard/_components/dashboard-context";
import { LucideIcon } from "lucide-react";
import { IconType } from "react-icons";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/components/ui/custom-link";
import { cn } from "@/helpers/utilsFns";

type PreviewCardProps = {
  fontSize?: string;
  card: {
    icon: IconType | LucideIcon;
    title: string;
    subTitle?: string;
    total: number;
    path: string;
  };
};

export const PreviewCard = ({
  fontSize,
  card: { icon: Icon, title, subTitle, total = 0, path },
}: PreviewCardProps) => {
  const { isSidebarCollapsed, setSidebarCollapsed } = useDashboard();
  const handleCollapseSidebar = () => {
    if (isSidebarCollapsed) return;
    setSidebarCollapsed(true);
  };
  return (
    <Card className="min-w-50 flex-1 md:max-w-80">
      <CardHeader className="flex flex-col pb-2">
        <span className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="my-auto size-4 shrink-0 text-muted-foreground" />
        </span>
        {subTitle && (
          <p className="text-xs italic text-muted-foreground">{subTitle}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{total}</div>
        <Link
          variant="subtleUnderline"
          onClick={handleCollapseSidebar}
          href={path}
        >
          <p className={cn("mt-1", fontSize)}>View all</p>
        </Link>
      </CardContent>
    </Card>
  );
};
