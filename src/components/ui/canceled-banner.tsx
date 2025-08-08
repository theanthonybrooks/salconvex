import { Link } from "@/components/ui/custom-link";
import { supportEmail } from "@/constants/siteInfo";
import { FaExclamationTriangle } from "react-icons/fa";

interface CanceledBannerProps {
  activeSub: boolean;
  subStatus: string;
}

export const CanceledBanner = ({
  activeSub,
  subStatus,
}: CanceledBannerProps) => {
  return (
    <>
      {!activeSub && (
        <>
          {subStatus === "past_due" && (
            <div className="mt-2 inline-flex items-center gap-1 rounded-lg border-1.5 border-red-600 bg-red-50 p-3 text-sm text-red-600">
              <FaExclamationTriangle className="color-red-600 mr-2 size-10 shrink-0" />

              <p>
                Your membership is past due. Please{" "}
                <Link
                  className="underline underline-offset-2"
                  href="/dashboard/account/billing"
                >
                  check your payment method
                </Link>{" "}
                and try again or{" "}
                <Link
                  className="underline underline-offset-2"
                  href={`mailto:${supportEmail}?Subject=Past Due Subscription`}
                >
                  contact support
                </Link>{" "}
                if you think this is an error.
              </p>
            </div>
          )}
          {subStatus === "canceled" && (
            <span className="mt-2 flex items-center gap-1 rounded-lg border-1.5 border-red-600 bg-red-50 p-3 text-sm text-red-600">
              <FaExclamationTriangle className="color-red-600 mr-2 size-10 shrink-0" />
              <p>
                Your membership has been canceled.{" "}
                <Link
                  className="underline underline-offset-2"
                  href="/pricing#plans"
                >
                  Resume
                </Link>{" "}
                to continue using the site.
              </p>{" "}
              <p>
                Please{" "}
                <Link
                  className="underline underline-offset-2"
                  href={`mailto:${supportEmail}?Subject=Canceled Subscription`}
                >
                  contact support
                </Link>{" "}
                if this is incorrect.
              </p>
            </span>
          )}
        </>
      )}
    </>
  );
};
