import type { FunctionReturnType } from "convex/server";

import { useState } from "react";
import { useIsMobile } from "@/hooks/use-media-query";

import { Filter, FilterX, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PopoverSimple } from "@/components/ui/popover";
import { SelectSimple } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { cn } from "@/helpers/utilsFns";
import { showToast } from "@/lib/toast";

import { api } from "~/convex/_generated/api";
import { useAction, useConvex, usePreloadedQuery } from "convex/react";

type Plans = 0 | 1 | 2 | 3;
type Frequencies = "monthly" | "weekly";
type Types = "general" | "openCall";

type AudienceData = FunctionReturnType<
  typeof api.newsletter.subscriber.getAudience
>;

type AudienceItems = NonNullable<AudienceData>["data"];
// type AudienceItem = NonNullable<AudienceItems>[number];

export const NewsletterMainPage = () => {
  const convex = useConvex();
  const isMobile = useIsMobile();
  const [type, setType] = useState<Types>("general");
  const [frequency, setFrequency] = useState<Frequencies>("monthly");
  const [expanded, setExpanded] = useState(isMobile);
  const [plan, setPlan] = useState<Plans>(2);
  const [test, setTest] = useState<boolean>(false);
  const sendEmails = useAction(api.actions.newsletter.sendNewsletter);
  const { preloadedUserData } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const { user } = userData || {};
  const [audience, setAudience] = useState<[] | AudienceItems>([]);
  const hasAudience = audience?.length > 0;

  //   const { ip, location } = useUserInfo();

  const [pending, setPending] = useState(false);
  const handleGetAudience = async () => {
    setPending(true);
    try {
      const result = await convex.query(api.newsletter.subscriber.getAudience, {
        type,
        frequency,
        plan,
        test,
      });
      if (result.success) {
        setAudience(result.data);
      } else {
        throw new Error("Failed to get audience");
      }
    } catch (e) {
      console.log(e);
    } finally {
      setPending(false);
    }
  };

  const handleSend = async () => {
    if (!user) throw new Error("User not found");
    if (!audience) return;

    setPending(true);
    try {
      const result = await sendEmails({
        audience,
      });
      if (result.success) {
        handleClearAudience();
        showToast(
          "success",
          `${result.totalSent} email${result.totalSent > 1 ? "s" : ""} sent`,
        );
      } else {
        throw new Error("Failed to send email");
      }
    } catch (err) {
      console.error("Failed to send email:", err);
      showToast("error", "Failed to send email");
    } finally {
      setPending(false);
    }
  };

  const handleClearAudience = () => {
    if (!hasAudience) return;
    setAudience([]);
  };
  return (
    <div className="px-10 pt-10">
      <div className="flex flex-col items-end gap-3 rounded-lg border-1.5 border-dashed border-foreground/30 bg-background/50 p-3 md:flex-row">
        <section className="flex w-full flex-col gap-2 md:w-auto">
          <h3>Admin Functions:</h3>
          <div className="flex items-center gap-2">
            <Button
              onClick={hasAudience ? handleSend : handleGetAudience}
              className="!sm:h-10 w-full md:w-40"
              variant="salWithShadowHidden"
              type="button"
            >
              {hasAudience ? (
                pending ? (
                  "Sending..."
                ) : (
                  "Send Test Email"
                )
              ) : pending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                "Gather Audience"
              )}
            </Button>
            {isMobile && (
              <Button
                onClick={() => setExpanded(!expanded)}
                className="!sm:h-10"
              >
                {expanded ? (
                  <FilterX className="size-6" />
                ) : (
                  <Filter className="size-6" />
                )}
              </Button>
            )}
          </div>
        </section>
        <Separator
          thickness={2}
          className="mx-2 hidden h-10 md:block"
          orientation="vertical"
        />
        <div
          className={cn(
            "flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-end",
            !expanded && isMobile && "hidden",
          )}
        >
          <section className="flex w-full flex-col gap-1">
            <span className="pl-1 text-sm text-foreground/70">Type</span>
            <SelectSimple
              className={cn("!h-10 w-full md:w-30")}
              value={type}
              onChangeAction={(val) => {
                setType(val as Types);
                handleClearAudience();
              }}
              options={[
                { value: "general", label: "General" },
                { value: "openCall", label: "Open Call" },
              ]}
            />
          </section>
          <section className="flex w-full flex-col gap-1">
            <span className="pl-1 text-sm text-foreground/70">Frequency</span>
            <SelectSimple
              className={cn("!h-10 w-full md:w-30")}
              value={frequency}
              onChangeAction={(val) => {
                setFrequency(val as Frequencies);
                handleClearAudience();
              }}
              options={[
                { value: "monthly", label: "Monthly" },
                { value: "weekly", label: "Weekly" },
              ]}
            />
          </section>
          <section className="flex w-full flex-col gap-1">
            <span className="pl-1 text-sm text-foreground/70">Plan</span>
            <SelectSimple
              className={cn("!h-10 w-full md:w-30")}
              value={String(plan)}
              onChangeAction={(val) => {
                setPlan(parseInt(val) as Plans);
                handleClearAudience();
              }}
              options={[
                { value: "0", label: "Free" },
                { value: "1", label: "Original" },
                { value: "2", label: "Banana" },
                { value: "3", label: "Fatcap" },
              ]}
            />
          </section>
          <section className="flex w-full flex-col gap-1">
            <span className="pl-1 text-sm text-foreground/70">Test</span>
            <SelectSimple
              className={cn("!h-10 w-full md:w-20")}
              value={String(test)}
              onChangeAction={(val) => {
                setTest(val === "true");
                handleClearAudience();
              }}
              options={[
                { value: "false", label: "No" },
                { value: "true", label: "Yes" },
              ]}
            />
          </section>
        </div>
        {hasAudience && (
          <PopoverSimple
            clickOnly
            content={
              <div className="scrollable mini darkbar max-h-30 px-3">
                <ol className="ml-1 list-outside list-decimal text-sm">
                  {audience.map((a) => (
                    <li key={a._id}>
                      <p className="truncate">{a.email}</p>
                    </li>
                  ))}
                </ol>
              </div>
            }
          >
            <span className="mb-3 w-full text-center text-sm sm:w-auto">
              {audience.length} matching subscribers
            </span>
          </PopoverSimple>
        )}
      </div>
    </div>
  );
};
