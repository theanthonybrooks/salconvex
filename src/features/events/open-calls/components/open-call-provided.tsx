import { formatCompCurrency } from "@/lib/eventFns";
import { cn } from "@/lib/utils";
import { OpenCall, openCallCategoryFields } from "@/types/openCall";
import { FaPaintRoller, FaUserCheck } from "react-icons/fa6";
import { IoAirplane } from "react-icons/io5";
import {
  PiForkKnifeFill,
  PiHouseLineFill,
  PiPencilLineFill,
} from "react-icons/pi";
import { TbStairs } from "react-icons/tb";

interface OpenCallProvidedProps {
  categories?: OpenCall["compensation"]["categories"];
  allInclusive?: boolean;
  noBudgetInfo?: boolean;
  currency?: string;
}

interface OpenCallProvidedPreviewProps extends OpenCallProvidedProps {
  id: string;
  format?: "desktop" | "mobile";
  className?: string;
}

const getDisplayValue = (
  val?: number | boolean,
  allInclusive = false,
  noBudgetInfo = false,
  currency?: string,
) => {
  if (typeof val === "number" && val && !allInclusive)
    return formatCompCurrency(val, currency ?? "USD");
  if (typeof val === "boolean" && val && !allInclusive) return "Provided";
  return (
    <span
      className={cn(
        "italic text-red-500",
        noBudgetInfo && "text-muted-foreground",
      )}
    >
      {!allInclusive ? "(not provided)" : "-"}
    </span>
  );
};

export const OpenCallProvided = ({
  categories,
  allInclusive,
  noBudgetInfo,
  currency,
}: OpenCallProvidedProps) => {
  return (
    <div className="flex flex-col justify-between pr-[1px]">
      {openCallCategoryFields.map(({ key, label }, index) => (
        <div
          key={key}
          className={cn(
            "flex items-center justify-between border-b border-dashed border-foreground/20 px-2 py-1",
            index % 2 === 0 ? "bg-transparent" : "bg-transparent",
          )}
        >
          <p className="font-medium">{label}:</p>
          <p className="text-right">
            {getDisplayValue(
              categories?.[key],
              allInclusive,
              noBudgetInfo,
              currency,
            )}
          </p>
        </div>
      ))}
    </div>
  );
};

export const OpenCallProvidedPreview = ({
  id,
  categories,
  noBudgetInfo,
  className,
  format = "desktop",
}: OpenCallProvidedPreviewProps) => {
  const isMobile = format === "mobile";
  const budgetItems = [
    { key: "artistStipend", Icon: FaUserCheck, source: "category" },
    { key: "designFee", Icon: PiPencilLineFill, source: "category" },
    { key: "accommodation", Icon: PiHouseLineFill, source: "category" },
    { key: "food", Icon: PiForkKnifeFill, source: "category" },
    { key: "materials", Icon: FaPaintRoller, source: "category" },
    { key: "travelCosts", Icon: IoAirplane, source: "category" },
    { key: "equipment", Icon: TbStairs, source: "category" },
    // { key: "budgetMoreInfo", Icon: FaRegCommentDots, source: "moreInfo" },
  ];

  return (
    <div
      id={`budget-icons-${id}`}
      className={cn(
        "flex max-w-full items-center gap-x-3",
        isMobile && "col-span-2 justify-center",
        !isMobile && "mt-2",
        className,
      )}
    >
      {budgetItems.map(({ key, Icon, source }) => {
        const active =
          source === "category"
            ? Boolean(categories?.[key as keyof typeof categories])
            : !noBudgetInfo;

        return (
          <span
            key={key}
            className={cn(
              "rounded-full border-1.5 p-1",
              active
                ? "border-emerald-500 text-emerald-500"
                : "border-foreground/20 text-foreground/20",
            )}
          >
            <Icon size={18} />
          </span>
        );
      })}
    </div>
  );
};
