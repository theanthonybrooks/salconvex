import SocialsRow from "@/components/ui/socials";
import { Source } from "@/hooks/use-filtered-events-query";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface SalHeaderProps {
  source: Source;
}

const SalHeader = ({ source }: SalHeaderProps) => {
  // const theListPg = source === "thelist";
  const thisWeekPg = source === "thisweek";
  return (
    <div
      className={cn(
        "mb-12 flex w-full flex-col items-center justify-center gap-2",
        thisWeekPg && "mb-4",
      )}
    >
      <Image
        src={thisWeekPg ? "/thisweek_logo.png" : "/saltext.png"}
        alt="The Street Art List"
        width={350}
        height={100}
        priority={true}
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
