import { FormLinksInput } from "@/components/ui/form-links-inputs";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { noEventCategories, prodOnlyCategories } from "@/constants/eventConsts";
import { EventOCFormValues } from "@/features/events/event-add-form";
import { getEventCategoryLabel } from "@/helpers/eventFns";
import { cn } from "@/helpers/utilsFns";
import { User } from "@/types/user";
import { Controller, useFormContext } from "react-hook-form";
import { HiArrowTurnLeftDown } from "react-icons/hi2";
import { Doc } from "~/convex/_generated/dataModel";

interface SubmissionFormEventStep2Props {
  user: User | undefined;
  isAdmin: boolean;
  isMobile: boolean;
  existingOrg: Doc<"organizations"> | null;
  existingEvent: Doc<"events"> | null;
  categoryEvent: boolean;
  canNameEvent: boolean;
  handleCheckSchema?: () => void;
  formType: number;
  dashBoardView?: boolean;
}

const SubmissionFormEventStep2 = ({
  // user,
  isAdmin,
  // isMobile,
  existingOrg,

  categoryEvent,
  canNameEvent,
  handleCheckSchema,
  formType,
  dashBoardView,
}: SubmissionFormEventStep2Props) => {
  const {
    control,
    watch,
    // setValue,
    // getValues,
    formState: {
      // errors,
      // dirtyFields,
    },
  } = useFormContext<EventOCFormValues>();
  // const currentValues = getValues();
  const category = watch("event.category");
  // const ocFormat = watch("event.hasOpenCall");
  const eventOnly = formType === 1;
  const freeCall = formType === 2;
  const isOngoing = watch("event.dates.eventFormat") === "ongoing";

  const noEvent = noEventCategories.includes(category);
  const prodOnly = prodOnlyCategories.includes(category);

  // #region ------------- Queries, Actions, and Mutations --------------

  // #endregion

  return (
    <div
      id="step-2-container"
      className={cn(
        "flex h-full w-full flex-col gap-4 sm:w-[90%] lg:w-full xl:justify-center",
        "mx-auto",
        "xl:mx-0 xl:grid xl:max-w-none xl:grid-cols-[45%_10%_45%] xl:gap-0",
      )}
    >
      <div
        className={cn(
          "flex w-full grid-cols-[20%_auto] flex-col lg:grid lg:gap-x-4 lg:gap-y-4",
          "self-start [&_.input-section:not(:first-of-type)]:mt-3 [&_.input-section:not(:first-of-type)]:lg:mt-0 [&_.input-section]:mb-2 [&_.input-section]:flex [&_.input-section]:w-full [&_.input-section]:items-start [&_.input-section]:gap-x-2 [&_.input-section]:lg:mb-0 [&_.input-section]:lg:mt-0 [&_.input-section]:lg:w-28 [&_.input-section]:lg:flex-col",
          "mx-auto xl:max-w-full xl:py-10 4xl:my-auto",
          "lg:max-w-[60dvw]",
          // "xl:self-center",
        )}
      >
        <div className="input-section">
          <p className="min-w-max font-bold lg:text-xl">
            Step{" "}
            {categoryEvent && !eventOnly && !isOngoing
              ? 10
              : (!categoryEvent && isOngoing) || noEvent || prodOnly
                ? 8
                : 9}
            :{" "}
          </p>
          <p className="lg:text-xs">
            {getEventCategoryLabel(category, true)} Links
          </p>
        </div>

        <div className="mx-auto flex w-full flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
          <Label htmlFor="event.category" className="sr-only">
            Event Links
          </Label>

          <FormLinksInput
            existingOrgHasLinks={!!existingOrg?.links}
            type="event"
            handleCheckSchema={handleCheckSchema}
            dashBoardView={dashBoardView}
          />
        </div>
      </div>

      <>
        <Separator
          thickness={2}
          className="mx-auto hidden xl:block"
          orientation="vertical"
        />

        <div
          className={cn(
            "flex w-full grid-cols-[20%_auto] flex-col items-center lg:grid lg:gap-x-4 lg:gap-y-4",
            "self-start lg:items-start [&_.input-section:not(:first-of-type)]:mt-3 [&_.input-section:not(:first-of-type)]:lg:mt-0 [&_.input-section]:mb-2 [&_.input-section]:flex [&_.input-section]:w-full [&_.input-section]:items-start [&_.input-section]:gap-x-2 [&_.input-section]:lg:mb-0 [&_.input-section]:lg:mt-0 [&_.input-section]:lg:w-28 [&_.input-section]:lg:flex-col",
            "mx-auto xl:max-w-full xl:py-10 4xl:my-auto",
            "lg:max-w-[60dvw]",
            // "xl:self-center",
          )}
        >
          {canNameEvent && (
            <>
              {/* <div className="input-section h-full">
                <p className="min-w-max font-bold lg:text-xl">
                  Step{" "}
                  {categoryEvent && !eventOnly && !isOngoing
                    ? 11
                    : (!categoryEvent && isOngoing) || noEvent || prodOnly
                      ? 9
                      : 10}
                  :{" "}
                </p>
                <p className="flex items-center gap-1 lg:text-xs">
                  Other {getEventCategoryLabel(category, true)} Info
                </p>
              </div>

              <div className="mx-auto flex w-full flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
                <Label htmlFor="event.name" className="sr-only">
                  {getEventCategoryLabel(category, true)} Other Info
                </Label>

                <Controller
                  name="event.otherInfo"
                  control={control}
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      placeholder="Add any other info about your project/event. Don't add open call details here."
                      charLimit={5000}
                      formInputPreview
                      inputPreviewContainerClassName="rounded-lg"
                    />
                  )}
                />
                <span className="w-full text-center text-xs italic text-muted-foreground">
                  (Formatting is for preview and won&apos;t exactly match the
                  public version)
                </span>
              </div> */}
              {/* <Separator
                thickness={2}
                className="col-span-full mx-auto my-2 block"
                orientation="horizontal"
              /> */}
              <p className="col-span-full mx-auto mb-2 font-medium">
                {eventOnly
                  ? "Open Call: Is this an invite-only event?"
                  : "Next section: Open Call Details"}
              </p>
              <div className="input-section">
                <p className="min-w-max font-bold lg:text-xl">
                  Step{" "}
                  {categoryEvent && !eventOnly && !isOngoing
                    ? 11
                    : (!categoryEvent && isOngoing) || noEvent || prodOnly
                      ? 9
                      : 10}
                  :
                </p>
                <p className="lg:text-xs">
                  {eventOnly ? "Invite Only" : "Open Call"}
                </p>
              </div>
              <div className="mx-auto mb-2 flex w-full flex-col gap-2 sm:mb-auto lg:min-w-[300px] lg:max-w-md">
                <Label htmlFor="event.hasOpenCall" className="sr-only">
                  {eventOnly ? "Invite Only" : "Open Call"}
                </Label>
                <Controller
                  name="event.hasOpenCall"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        // setHasOpenCall(value);
                      }}
                      value={field.value ?? ""}
                    >
                      <SelectTrigger className="h-12 w-full border bg-card text-center text-base sm:h-[50px]">
                        <SelectValue
                          placeholder={
                            !freeCall
                              ? `Do you have an open call?`
                              : `Select the type of call`
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="min-w-auto">
                        {!eventOnly && (
                          <>
                            {!freeCall && isAdmin && (
                              <>
                                <SelectItem fit value="False">
                                  No, there&apos;s not an open call
                                </SelectItem>
                                <SelectItem fit value="Invite">
                                  No, it&apos;s an invite only event
                                </SelectItem>
                                {/* <p className="border-y-2 border-dotted border-foreground/50 bg-salYellowLt/20 px-2 py-2 text-sm">
                                Or select the type of call:
                              </p> */}
                                <SelectSeparator />{" "}
                                <span className="flex items-center gap-1 px-3 py-1 text-xs italic text-muted-foreground">
                                  <HiArrowTurnLeftDown className="size-4 shrink-0 translate-y-1.5" />
                                  Or select the type of call
                                </span>
                              </>
                            )}
                            <SelectItem fit value="Fixed">
                              Fixed Deadline
                            </SelectItem>
                            <SelectItem fit value="Rolling">
                              Rolling Open Call
                            </SelectItem>
                            <SelectItem fit value="Email">
                              Open email submissions
                            </SelectItem>
                          </>
                        )}
                        {eventOnly && (
                          <>
                            <SelectGroup>
                              <SelectLabel className="text-sm text-muted-foreground">
                                Is it an invite only event?
                              </SelectLabel>
                              <SelectItem fit value="Invite">
                                Yes
                              </SelectItem>
                              <SelectItem fit value="False">
                                No
                              </SelectItem>
                            </SelectGroup>
                          </>
                        )}
                        {isAdmin && (
                          <SelectItem
                            fit
                            value="Unknown"
                            className="bg-red-100 italic"
                          >
                            Unknown - Admin Only
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {isAdmin && (
                <>
                  <Separator
                    thickness={2}
                    className="col-span-full mx-auto my-2 block"
                    orientation="horizontal"
                  />
                  <div className="input-section h-full">
                    <p className="lg:text-xs">Admin Notes</p>
                  </div>

                  <div className="mx-auto flex w-full flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
                    <Label htmlFor="event.name" className="sr-only">
                      Admin Notes
                    </Label>

                    <Controller
                      name="event.adminNote"
                      control={control}
                      render={({ field }) => (
                        <RichTextEditor
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          charLimit={2000}
                          placeholder="Notes to self (or other admins)"
                          formInputPreview
                          inputPreviewContainerClassName="rounded-lg"
                        />
                      )}
                    />
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </>
    </div>

    //   )}
  );
};

export default SubmissionFormEventStep2;
