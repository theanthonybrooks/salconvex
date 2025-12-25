import { supportEmail } from "@/constants/siteInfo";

import Image from "next/image";

import { Link } from "@/components/ui/custom-link";

type OrganizerErrorPageProps = {
  type: "incomplete" | "notFound";
};

export const OrganizerErrorPage = ({ type }: OrganizerErrorPageProps) => {
  return (
    <div className="flex min-h-[min(90dvh,600px)] flex-col items-center justify-center gap-4 py-8">
      {type === "notFound" && (
        <Image
          src="/nothinghere.gif"
          alt="Organizer Not Found gif"
          width={300}
          height={300}
          className="mx-auto mb-4 max-w-[90vw] rounded-full border-2"
        />
      )}
      <p className="text-lg font-bold">
        {type === "notFound"
          ? "Organizer not found"
          : "You haven't added any events or open calls yet"}
      </p>

      {type === "incomplete" && (
        <p className="text-sm">
          Please{" "}
          <Link href="/submit" variant="bold">
            do so
          </Link>{" "}
          to make your organization&apos;s profile public.
        </p>
      )}
      <p className="text-sm">
        If you think this is an error, please{" "}
        <Link
          href={`mailto:${supportEmail}?Subject=${type === "notFound" ? "Missing Organization" : "Incomplete Organization Error"}`}
          variant="bold"
        >
          contact support
        </Link>
        .
      </p>
    </div>
  );
};
