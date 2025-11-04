"use client";

import Image from "next/image";
import Link from "next/link";
import { Source } from "@/hooks/use-filtered-events-query";

import SocialsRow from "@/components/ui/socials";
import { cn } from "@/helpers/utilsFns";

interface SalHeaderProps {
  source: Source;
}

const SalHeader = ({ source }: SalHeaderProps) => {
  // const pathname = usePathname();
  // const [view, setView] = useState<ViewOptions | null>(null);

  // useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     setView(sessionStorage.getItem("salView") as ViewOptions);
  //   }
  // }, [pathname]);

  // console.log(view);

  // const archivePg = source === "thelist" && view === "archive";

  // console.log(archivePg);

  const thisWeekPg = source === "thisweek";
  const archivePg = source === "archive";

  return (
    <div
      className={cn(
        "mb-12 flex w-full flex-col items-center justify-center gap-2",
        thisWeekPg && "mb-4",
      )}
    >
      <Image
        src={
          thisWeekPg
            ? "/thisweek_logo.png"
            : archivePg
              ? "/branding/archive.png"
              : "/saltext.png"
        }
        alt="The Street Art List"
        width={300}
        height={100}
        priority={true}
        className="[@media(max-width:724px)]:w-64"
      />
      {!thisWeekPg && (
        <>
          <p className="mb-4 mt-2 text-center text-sm">
            List of street art, graffiti, & mural projects.
            <br /> Info gathered and shared by{" "}
            <Link
              href="https://instagram.com/anthonybrooksart"
              target="_blank"
              className="font-semibold"
            >
              @anthonybrooksart
            </Link>
          </p>

          <SocialsRow className="size-8 md:size-6" contClassName="gap-8" />
        </>
      )}
    </div>
  );
};

export default SalHeader;
