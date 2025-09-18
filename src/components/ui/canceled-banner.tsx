import { Link } from "@/components/ui/custom-link";
import { supportEmail } from "@/constants/siteInfo";
import { cn } from "@/lib/utils";
import { FaExclamationTriangle } from "react-icons/fa";

interface CanceledBannerProps {
  activeSub: boolean;
  subStatus: string;
  fontSize?: "text-sm" | "text-base";
}

export const CanceledBanner = ({
  activeSub,
  subStatus,
  fontSize = "text-sm",
}: CanceledBannerProps) => {
  return (
    <>
      {!activeSub && (
        <>
          {subStatus === "past_due" && (
            <div
              className={cn(
                "mt-2 inline-flex items-center gap-1 rounded-lg border-1.5 border-red-600 bg-red-50 p-3 text-red-600",
                fontSize,
              )}
            >
              <FaExclamationTriangle className="color-red-600 mr-2 size-10 shrink-0" />

              <p>
                Your membership is past due. Please{" "}
                <Link
                  className="underline underline-offset-2"
                  href="/dashboard/billing"
                  fontSize={fontSize}
                >
                  check your payment method
                </Link>{" "}
                and try again or{" "}
                <Link
                  className="underline underline-offset-2"
                  href={`mailto:${supportEmail}?Subject=Past Due Subscription`}
                  fontSize={fontSize}
                >
                  contact support
                </Link>{" "}
                if you think this is an error.
              </p>
            </div>
          )}
          {subStatus === "canceled" && (
            <span
              className={cn(
                "mt-2 flex items-center gap-1 rounded-lg border-1.5 border-red-600 bg-red-50 p-3 text-red-600",
                fontSize,
              )}
            >
              <FaExclamationTriangle className="color-red-600 mr-2 size-10 shrink-0" />

              <p>
                Your membership has been canceled.{" "}
                <Link
                  className="underline underline-offset-2"
                  href="/pricing#plans"
                  fontSize={fontSize}
                >
                  Select a plan
                </Link>{" "}
                to continue using the site.{" "}
                <Link
                  className="underline underline-offset-2"
                  href={`mailto:${supportEmail}?Subject=Canceled Subscription`}
                  fontSize={fontSize}
                >
                  Contact support
                </Link>{" "}
                if you believe this is an error.
              </p>
            </span>
          )}
        </>
      )}
    </>
  );
};
