import Link from "next/link";

import { Button } from "@/components/ui/button";

type Props = {
  label: string;
  href: string;
};

const BackButton = ({ label, href }: Props) => {
  return (
    <Button variant="link" size="lg" className="w-full font-normal">
      <Link href={href}>{label}</Link>
    </Button>
  );
};

export default BackButton;
