import type { NewsletterToolbarType } from "@/schemas/newsletter";
import type { Id as ToastIdType } from "react-toastify";

import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-media-query";
import { newsletterToolbarSchema } from "@/schemas/newsletter";
import { zodResolver } from "@hookform/resolvers/zod";
import { addHours } from "date-fns";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { Filter, FilterX, LoaderCircle } from "lucide-react";

import type { Id } from "~/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/custom-link";
import { DateTimePickerField } from "@/components/ui/date-picker/day-picker";
import { DebouncedControllerInput } from "@/components/ui/debounced-form-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { SelectSimple } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { getNextHour } from "@/helpers/dateFns";
import { cn } from "@/helpers/utilsFns";
import { showLoadingToast, showToast } from "@/lib/toast";

import { api } from "~/convex/_generated/api";
import { useQuery } from "convex-helpers/react/cache";
import { useMutation } from "convex/react";

type Plans = 0 | 1 | 2 | 3;
type Frequencies = "monthly" | "weekly" | "all";
type Types = "general" | "openCall";

export const NewsletterToolbar = () => {
  const isMobile = useIsMobile();

  const defaultValues = {
    title: "New Campaign",
    type: "general" as Types,
    frequency: "monthly" as Frequencies,
    userPlan: 2 as Plans,
    test: false,
    sendTime: getNextHour().getTime(),
  };

  const form = useForm<NewsletterToolbarType>({
    resolver: zodResolver(newsletterToolbarSchema),
    defaultValues,
    mode: "onChange",
    delayError: 1000,
  });

  const {
    handleSubmit,
    setError,
    formState: { isValid, isDirty },
  } = form;

  console.log(isValid, isDirty);

  const [expanded, setExpanded] = useState(isMobile);

  // const sendEmails = useAction(api.actions.newsletter.sendNewsletter);
  const createCampaign = useMutation(
    api.newsletter.campaign.createNewsletterCampaign,
  );

  // const [audience, setAudience] = useState<[] | AudienceItems>([]);
  const [audienceToastId, setAudienceToastId] = useState<ToastIdType | null>(
    null,
  );
  const [campaignId, setCampaignId] = useState<Id<"newsletterCampaign"> | null>(
    null,
  );

  const campaignData = useQuery(
    api.newsletter.campaign.getCampaignById,
    campaignId ? { campaignId } : "skip",
  );

  const { audienceStatus } = campaignData ?? {};
  const hasAudience = audienceStatus === "complete";
  const inProgressAudience = audienceStatus === "inProgress";

  const [pending, setPending] = useState(false);
  const handleCreateCampaign = async (data: NewsletterToolbarType) => {
    const { title, type, frequency, userPlan: plan, test, sendTime } = data;
    setPending(true);
    try {
      const result = await createCampaign({
        title,
        type,
        frequency,
        userPlan: plan,
        isTest: test,
        plannedSendTime: sendTime,
      });

      if (result.success) {
        setCampaignId(result.campaignId ?? null);
        const toastId = showLoadingToast("Building audience...");
        setAudienceToastId(toastId);
        form.reset(defaultValues);
      } else {
        showToast("error", result.message ?? "Failed to create campaign");
        if (result.message?.includes("name"))
          setError("title", { type: "manual" });
      }
    } catch (e) {
      console.log(e);
    } finally {
      setPending(false);
    }
  };

  // const handleSend = async () => {
  //   if (!user) throw new Error("User not found");
  //   if (!audience) return;

  //   setPending(true);
  //   try {
  //     const result = await sendEmails({
  //       audience,
  //     });
  //     if (result.success) {
  //       handleClearAudience();
  //       showToast(
  //         "success",
  //         `${result.totalSent} email${result.totalSent > 1 ? "s" : ""} sent`,
  //       );
  //     } else {
  //       throw new Error("Failed to send email");
  //     }
  //   } catch (err) {
  //     console.error("Failed to send email:", err);
  //     showToast("error", "Failed to send email");
  //   } finally {
  //     setPending(false);
  //   }
  // };

  // const handleClearAudience = () => {
  //   if (!hasAudience) return;
  //   setAudience([]);
  //   // form.reset(defaultValues)
  // };

  useEffect(() => {
    if (!campaignData || !audienceToastId) return;

    switch (campaignData.audienceStatus) {
      case "complete": {
        setTimeout(() => {
          toast.update(audienceToastId, {
            render: `Audience generated! (Total:${campaignData.audienceCount})`,
            type: "success",
            isLoading: false,
            autoClose: 2000,
          });
          setAudienceToastId(null);
        }, 1000);
        break;
      }

      case "failed": {
        setTimeout(() => {
          toast.update(audienceToastId, {
            render: "Audience generation failed",
            type: "error",
            isLoading: false,
            autoClose: 2000,
          });
          setAudienceToastId(null);
        }, 1000);

        break;
      }

      default:
        // maybe add something later. For now, it's just waiting
        break;
    }
  }, [campaignData, audienceToastId]);

  useEffect(() => {
    if (!campaignId) return;
    if (campaignId && isDirty) setCampaignId(null);
  }, [campaignId, isDirty]);

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(handleCreateCampaign)}
        className="flex flex-col items-end gap-3 rounded-lg border-1.5 border-dashed border-foreground/20 bg-card/70 p-3 md:flex-row"
      >
        <section className="flex flex-col items-center gap-2">
          <h3>{hasAudience ? "View" : "Create"} Campaign:</h3>
          <div className="flex items-center gap-2">
            {hasAudience ? (
              <Button
                asChild
                className="!sm:h-10 w-full md:w-40"
                variant="salWithShadowHidden"
              >
                <Link
                  variant="standard"
                  href={`/dashboard/newsletter/campaigns?id=${campaignId}`}
                >
                  Go to Campaign
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  className="!sm:h-10 w-full md:w-40"
                  variant="salWithShadowHidden"
                >
                  {pending || inProgressAudience ? (
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
              </>
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
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="col-span-3 w-full">
                <FormLabel className="font-bold">Title</FormLabel>
                <FormControl>
                  <DebouncedControllerInput
                    tabIndex={1}
                    field={field}
                    placeholder="Campaign Title"
                    className="w-full min-w-40"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="col-span-3 w-full">
                <FormLabel className="font-bold">Type</FormLabel>
                <FormControl>
                  <SelectSimple
                    options={[
                      { value: "general", label: "General" },
                      { value: "openCall", label: "Open Call" },
                    ]}
                    value={field.value ?? ""}
                    onChangeAction={(value) => field.onChange(value)}
                    placeholder="Select location"
                    className="w-full min-w-25 border-gray-300 bg-card sm:h-11"
                    contentClassName="sm:max-h-80 "
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="frequency"
            render={({ field }) => (
              <FormItem className="col-span-3 w-full">
                <FormLabel className="font-bold">Frequency</FormLabel>
                <FormControl>
                  <SelectSimple
                    options={[
                      { value: "monthly", label: "Monthly" },
                      { value: "weekly", label: "Weekly" },
                      { value: "all", label: "All" },
                    ]}
                    value={field.value ?? ""}
                    onChangeAction={(value) => field.onChange(value)}
                    placeholder="Select location"
                    className="w-full border-gray-300 bg-card sm:h-11"
                    contentClassName="sm:max-h-80 "
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="userPlan"
            render={({ field }) => (
              <FormItem className="col-span-3 w-full">
                <FormLabel className="font-bold">Plan</FormLabel>
                <FormControl>
                  <SelectSimple
                    options={[
                      { value: "0", label: "Free" },
                      { value: "1", label: "Original" },
                      { value: "2", label: "Banana" },
                      { value: "3", label: "Fat Cap" },
                    ]}
                    value={String(field.value) ?? ""}
                    onChangeAction={(value) => field.onChange(parseInt(value))}
                    placeholder="Select location"
                    className="w-full border-gray-300 bg-card sm:h-11"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sendTime"
            render={({ field }) => {
              const oneHourFromNow = addHours(new Date(), 1).getTime();
              return (
                <FormItem className="w-full min-w-50">
                  <FormLabel className="font-bold">Send Time</FormLabel>
                  <FormControl>
                    <DateTimePickerField
                      minDate={oneHourFromNow}
                      value={field.value}
                      onChange={field.onChange}
                      inputClassName="border-gray-300 bg-card"
                    />
                  </FormControl>
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="test"
            render={({ field }) => (
              <FormItem className="col-span-3 w-full max-w-16">
                <FormLabel className="font-bold">Test</FormLabel>
                <FormControl>
                  <SelectSimple
                    className="border-gray-300 bg-card sm:h-11"
                    value={String(field.value) ?? ""}
                    onChangeAction={(val) => {
                      field.onChange(val === "true");
                    }}
                    options={[
                      { value: "false", label: "No" },
                      { value: "true", label: "Yes" },
                    ]}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
};
