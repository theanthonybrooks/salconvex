import { ReactNode } from "react";
import Link from "next/link";

interface ConvexDashboardLinkProps {
  table: string;
  children: ReactNode;
  id?: string;
  className?: string;
}

export const ConvexDashboardLink = ({
  table,
  id,
  className,
  children,
}: ConvexDashboardLinkProps) => {
  const handleCopy = () => {
    if (!id) return;
    navigator.clipboard.writeText(id);
  };

  return (
    <Link
      href={`${process.env.NEXT_PUBLIC_CONVEX_DASHBOARD_URL}data?table=${table}&id=${id}`}
      target="_blank"
      onClick={handleCopy}
      className={className}
    >
      {children}
    </Link>
  );
};
