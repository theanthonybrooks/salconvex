"use client";

import { PostPropertiesDashboard } from "@/components/ui/post-properties-dashboard";
import { cn } from "@/lib/utils";
import { OpenCallData } from "@/types/openCall";

import { OpenCallPost } from "@/app/(pages)/(artist)/thelist/components/open-call-post";
import { Link } from "@/components/ui/custom-link";
import { PostCaptionDialog } from "@/components/ui/post-caption-dialog";
import {
  ArrowLeft,
  LetterText,
  LoaderCircle,
  LucideIcon,
  Settings2,
} from "lucide-react";
import { ComponentType, useState } from "react";
import { BiPhotoAlbum } from "react-icons/bi";
import { toast } from "react-toastify";

interface OpenCallSocialsProps {
  data: OpenCallData | null;
}
export interface PostSettings {
  fontSize: number;
  bgColor: string;
  budget: boolean;
}

const OpenCallSocials = ({ data }: OpenCallSocialsProps) => {
  const defaultColor = "hsla(50, 100%, 72%, 1.0)";
  const [loading, setLoading] = useState(false);
  const [postSettings, setPostSettings] = useState<PostSettings>({
    fontSize: 30,
    bgColor: defaultColor,
    budget: false,
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [textDialogOpen, setTextDialogOpen] = useState(false);

  const postMenuItems: MenuItem[] = [
    {
      key: "caption",
      icon: LetterText,
      onClick: () => {
        setTextDialogOpen(true);
      },
    },
    {
      key: "photos",
      icon: BiPhotoAlbum,
      onClick: () => {
        handleDownloadSingle();
      },
      actionable: true,
    },
    {
      key: "settings",
      icon: Settings2,
      onClick: () => {
        setSettingsOpen((prev) => !prev);
      },
    },
  ];

  // useClickOutside(dashboardRef, () => setSettingsOpen(false), settingsOpen);

  if (!data) return <p>No Data</p>;
  const { event } = data;

  const handlePostSettingsChange = (update: Partial<typeof postSettings>) => {
    setPostSettings((prev) => ({ ...prev, ...update }));
  };

  const handleDownloadSingle = async () => {
    setLoading(true);
    const { origin } = window.location;

    const fontSize = postSettings.fontSize.toString();
    const bgColor = encodeURIComponent(postSettings.bgColor);
    const budget = postSettings.budget.toString();
    const slug = event.slug;
    const year = event.dates.edition.toString();

    const pageUrl = `${origin}/render/post?slug=${slug}&year=${year}&fontSize=${fontSize}&bgColor=${bgColor}&budget=${budget}`;

    try {
      await toast.promise(
        (async () => {
          const res = await fetch(
            `/api/screenshot?url=${encodeURIComponent(pageUrl)}`,
          );
          if (!res.ok) throw new Error("Failed to fetch screenshot");

          const blob = await res.blob();
          const urlBlob = URL.createObjectURL(blob);

          const link = document.createElement("a");
          link.href = urlBlob;
          link.download = `${event.name}.jpg`;
          link.click();

          URL.revokeObjectURL(urlBlob);
        })(),
        {
          pending: "Creating post...",
          success: "Post created successfully!",
          error: "Failed to create post.",
        },
        {
          autoClose: 2000,
          pauseOnHover: false,
        },
      );
    } catch (error) {
      console.error("Failed to create post:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full px-10">
      <Link
        className={cn("flex w-max items-center gap-2 self-start")}
        href={`/thelist/event/${event.slug}/${event.dates.edition}/call`}
      >
        <ArrowLeft className="size-5" />
        <p>Back to Open Call</p>
      </Link>
      <div
        className={cn(
          "relative my-10 flex w-full flex-col justify-items-center lg:grid lg:grid-cols-2",
        )}
      >
        <section className={cn("flex flex-col gap-3")}>
          <p>Social Media Post</p>
          <div className="group relative">
            <PostMenu items={postMenuItems} loading={loading} />

            <div className={cn("origin-top-left scale-[0.72] sm:scale-100")}>
              <OpenCallPost data={data} postSettings={postSettings} />
            </div>

            <PostPropertiesDashboard
              fontSize={postSettings.fontSize}
              bgColor={postSettings.bgColor}
              budget={postSettings.budget}
              onChange={handlePostSettingsChange}
              open={settingsOpen}
              setOpen={setSettingsOpen}
            />

            <PostCaptionDialog
              data={data}
              open={textDialogOpen}
              setOpen={setTextDialogOpen}
            />
          </div>
        </section>
        {/* <section className={cn("flex flex-col gap-3")}>
          <p>Social Media Story</p>
          <div className="h-[889px] w-[500px] rounded-sm border-3"></div>
        </section> */}
      </div>
    </div>
  );
};

export default OpenCallSocials;

type MenuItem = {
  key: string;
  icon: LucideIcon | ComponentType<{ className?: string }>;
  onClick: () => void;
  actionable?: boolean;
};

type PostMenuProps = {
  className?: string;
  items: MenuItem[];
  loading?: boolean;
};

const PostMenu = ({ className, items, loading }: PostMenuProps) => {
  return (
    <div
      className={cn(
        "absolute right-4 top-4 z-10 hidden items-center gap-2 rounded-lg border-1.5 bg-card p-3 transition-all duration-300 ease-in-out group-hover:flex",
        className,
      )}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const actionableItem = item.actionable;
        return (
          <button
            key={item.key}
            className="cursor-pointer rounded bg-card-secondary p-1 ring-1.5 ring-foreground/10 hover:scale-105 hover:ring-2 hover:ring-foreground/25 active:scale-95"
            onClick={item.onClick}
          >
            {actionableItem && loading ? (
              <LoaderCircle className="size-6 animate-spin" />
            ) : (
              <Icon className="size-6" />
            )}
          </button>
        );
      })}
    </div>
  );
};
