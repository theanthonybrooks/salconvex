import Link from "next/link";
import { ReactNode } from "react";

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
      href={`https://dashboard.convex.dev/t/theanthonybrooks/streetartlist/flexible-narwhal-975/data?table=${table}`}
      target="_blank"
      onClick={handleCopy}
      className={className}
    >
      {children}
    </Link>
  );
};
