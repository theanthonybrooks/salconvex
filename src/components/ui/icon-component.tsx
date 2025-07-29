import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

type Props = {
  icon: ReactNode | LucideIcon;
};

function IconComponent({ icon }: Props) {
  if (!icon) return null;

  if (typeof icon === "object" && "type" in icon) {
    return icon;
  }

  if (typeof icon === "function") {
    const Component = icon;
    return <Component className="size-5" />;
  }
  return null;
}

export default IconComponent;
