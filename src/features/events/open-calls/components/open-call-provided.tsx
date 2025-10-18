import { TooltipSimple } from "@/components/ui/tooltip";
import { openCallCategoryFields } from "@/constants/openCallConsts";
import { siteUrl } from "@/constants/siteInfo";
import { formatCurrency } from "@/helpers/currencyFns";
import { cn } from "@/helpers/utilsFns";
import { OpenCall } from "@/types/openCallTypes";
import { X } from "lucide-react";
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
  allInclusive?: boolean,
  noBudgetInfo?: boolean,
  currency?: string,
) => {
  if (typeof val === "number" && val)
    return formatCurrency(val, currency ?? "USD");
  if (typeof val === "boolean" && val) return "Provided";
  return (
    <span
      className={cn(
        "italic text-red-500",
        // noBudgetInfo && "text-muted-foreground",
      )}
    >
      {/* (not provided) */}
      <X className="inline-block size-4" />
    </span>
  );
};

export const OpenCallProvided = ({
  categories,
  allInclusive,
  noBudgetInfo,
  currency,
}: OpenCallProvidedProps) => {
  if (allInclusive)
    return (
      <span className="text-red-500">
        <p className="font-bold">All inclusive budget:</p>
        <p className="italic text-red-500">
          The project budget is intended to be used for any and all costs
          related to the project and any additional costs will be the
          responsibility of the artist.
        </p>
        <br />
        <p className="text-xs text-foreground/50">
          What does this mean?{" "}
          <a
            href={`${siteUrl[0]}/faq#all-inclusive`}
            target="_blank"
            className="underline"
          >
            Learn more
          </a>
        </p>
      </span>
    );

  return (
    <>
      <div className="flex flex-col justify-between pr-[1px]">
        {openCallCategoryFields.map(({ value, label }, index) => (
          <div
            key={value}
            className={cn(
              "flex items-center justify-between border-b border-dashed border-foreground/20 px-2 py-1",
              index % 2 === 0 ? "bg-transparent" : "bg-transparent",
            )}
          >
            <p className="font-medium">{label}:</p>
            <p className="text-right">
              {getDisplayValue(
                categories?.[value],
                allInclusive,
                noBudgetInfo,
                currency,
              )}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-1 w-full text-right text-xs text-red-500">
        ( <X className="inline-block size-3" />= not provided )
      </p>
    </>
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
            <TooltipSimple
              content={
                openCallCategoryFields.find((field) => field.value === key)
                  ?.label ?? key
              }
            >
              <Icon size={18} />
            </TooltipSimple>
          </span>
        );
      })}
    </div>
  );
};
