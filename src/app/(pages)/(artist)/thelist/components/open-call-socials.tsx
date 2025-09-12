"use client";

import { PostPropertiesDashboard } from "@/components/ui/post-properties-dashboard";
import { cn } from "@/lib/utils";
import { OpenCallData } from "@/types/openCall";

import { OpenCallPost } from "@/app/(pages)/(artist)/thelist/components/open-call-post";
import { LucideIcon, Settings2 } from "lucide-react";
import { ComponentType, useEffect, useRef, useState } from "react";
import { BiPhotoAlbum } from "react-icons/bi";

interface OpenCallSocialsProps {
  data: OpenCallData | null;
}
export interface PostSettings {
  fontSize: number;
  bgColor: string;
  budget: boolean;
}

export function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  handler: () => void,
  active = true,
) {
  useEffect(() => {
    if (!active) return;

    const listener = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target) return;
      if (ref.current?.contains(target)) return;
      if (target.closest("[data-radix-popper-content-wrapper]")) return;
      if (target.closest("[data-radix-portal]")) return;
      if (target.closest("[role=dialog]")) return;
      handler();
    };

    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler, active]);
}

const OpenCallSocials = ({ data }: OpenCallSocialsProps) => {
  const dashboardRef = useRef<HTMLDivElement | null>(null);

  const [postSettings, setPostSettings] = useState<PostSettings>({
    fontSize: 30,
    bgColor: "hsla(50, 100%, 72%, 1.0)",
    budget: false,
  });
  const [settingsOpen, setSettingsOpen] = useState(false);

  const postMenuItems: MenuItem[] = [
    {
      key: "photos",
      icon: BiPhotoAlbum,
      onClick: () => {
        handleDownloadSingle();
      },
    },
    {
      key: "settings",
      icon: Settings2,
      onClick: () => {
        setSettingsOpen((prev) => !prev);
      },
    },
  ];

  useClickOutside(dashboardRef, () => setSettingsOpen(false), settingsOpen);

  if (!data) return <p>No Data</p>;
  const { event } = data;

  const handlePostSettingsChange = (update: Partial<typeof postSettings>) => {
    setPostSettings((prev) => ({ ...prev, ...update }));
  };

  const handleDownloadSingle = async () => {
    const { origin } = window.location;

    const fontSize = postSettings.fontSize.toString();
    const bgColor = encodeURIComponent(postSettings.bgColor);
    const budget = postSettings.budget.toString();
    const slug = event.slug;
    const year = event.dates.edition.toString();

    const pageUrl = `${origin}/render/post?slug=${slug}&year=${year}&fontSize=${fontSize}&bgColor=${bgColor}&budget=${budget}`;

    const res = await fetch(
      `/api/screenshot?url=${encodeURIComponent(pageUrl)}`,
    );

    if (!res.ok) {
      console.error("Failed to fetch screenshot");
      return;
    }

    const blob = await res.blob();
    const urlBlob = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = urlBlob;
    link.download = `${event.name}.jpg`;
    link.click();

    URL.revokeObjectURL(urlBlob);
  };

  return (
    <div
      className={cn(
        "relative my-10 flex w-full flex-col justify-items-center lg:grid lg:grid-cols-2",
      )}
    >
      <section className={cn("flex flex-col gap-3")}>
        <p>Social Media Post</p>
        <div className="group relative">
          <PostMenu items={postMenuItems} />

          <OpenCallPost data={data} postSettings={postSettings} />
          {settingsOpen && (
            <PostPropertiesDashboard
              ref={dashboardRef}
              fontSize={postSettings.fontSize}
              bgColor={postSettings.bgColor}
              budget={postSettings.budget}
              onChange={handlePostSettingsChange}
              className={cn("absolute -right-5 top-0 flex translate-x-full")}
              setOpen={setSettingsOpen}
            />
          )}
        </div>
      </section>
      <section className={cn("flex flex-col gap-3")}>
        <p>Social Media Story</p>
        <div className="h-[889px] w-[500px] rounded-sm border-3"></div>
      </section>
    </div>
  );
};

export default OpenCallSocials;

type MenuItem = {
  key: string;
  icon: LucideIcon | ComponentType<{ className?: string }>;
  onClick: () => void;
};

type PostMenuProps = {
  className?: string;
  items: MenuItem[];
};

const PostMenu = ({ className, items }: PostMenuProps) => {
  return (
    <div
      className={cn(
        "absolute right-4 top-4 z-10 hidden items-center gap-2 rounded-lg border-1.5 bg-card p-3 transition-all duration-300 ease-in-out group-hover:flex",
        className,
      )}
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.key}
            className="cursor-pointer rounded border-1.5 border-foreground/10 bg-card-secondary p-1 hover:scale-105 active:scale-95"
            onClick={item.onClick}
          >
            <Icon className="size-6" />
          </button>
        );
      })}
    </div>
  );
};
