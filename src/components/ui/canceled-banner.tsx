import { format } from "date-fns";

import { FaExclamationTriangle } from "react-icons/fa";

import { Link } from "@/components/ui/custom-link";
import { cn } from "@/helpers/utilsFns";

interface CanceledBannerProps {
  activeSub: boolean;
  subStatus?: string;
  fontSize?: string;
  willCancel?: number;
}

export const CanceledBanner = ({
  activeSub,
  subStatus,
  fontSize = "text-sm",
  willCancel,
}: CanceledBannerProps) => {
  if (!willCancel && subStatus !== "canceled" && subStatus !== "past_due")
    return null;
  const pendingCancelTime = willCancel ? new Date(willCancel) : null;
  return (
    <div
      className={cn(
        "mt-2 inline-flex items-center gap-1 rounded-lg border-1.5 border-red-600 bg-red-50 p-3 text-red-600",
        fontSize,
      )}
    >
      <FaExclamationTriangle className="color-red-600 mr-2 size-10 shrink-0" />
      {activeSub && pendingCancelTime ? (
        <p>
          Your membership will cancel on{" "}
          {format(pendingCancelTime, "MMM do, yyyy")}.{" "}
          <Link
            className="underline underline-offset-2"
            href="/dashboard/billing"
            fontSize={fontSize}
          >
            Reactivate your membership
          </Link>{" "}
          to continue using the site after this date. (Or{" "}
          <Link
            className="underline underline-offset-2"
            href="/support?reason=account"
            fontSize={fontSize}
          >
            Contact support
          </Link>{" "}
          )
        </p>
      ) : !activeSub ? (
        <>
          {subStatus === "past_due" && (
            <p>
              There was a problem with your last payment. Please{" "}
              <Link
                className="underline underline-offset-2"
                href="/dashboard/billing"
                fontSize={fontSize}
              >
                update your payment method
              </Link>{" "}
              and try again. (Or{" "}
              <Link
                className="underline underline-offset-2"
                href="/support?reason=account"
                fontSize={fontSize}
              >
                Contact support
              </Link>{" "}
              )
            </p>
          )}
          {subStatus === "canceled" && (
            <p>
              Your membership has been canceled.{" "}
              <Link
                className="underline underline-offset-2"
                href="/pricing"
                fontSize={fontSize}
              >
                Select a plan
              </Link>{" "}
              to continue using the site. (Or{" "}
              <Link
                className="underline underline-offset-2"
                href="/support?reason=account"
                fontSize={fontSize}
              >
                Contact support
              </Link>{" "}
              )
            </p>
          )}
        </>
      ) : null}
    </div>
  );
};
