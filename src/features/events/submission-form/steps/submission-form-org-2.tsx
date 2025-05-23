import { DebouncedControllerInput } from "@/components/ui/debounced-form-input";
import { FormLinksInput } from "@/components/ui/form-links-inputs";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Separator } from "@/components/ui/separator";
import { EventOCFormValues } from "@/features/events/event-add-form";
import { cn } from "@/lib/utils";
import { Controller, useFormContext } from "react-hook-form";

interface SubmissionFormOrgStep2Props {
  handleCheckSchema?: () => void;
}

const SubmissionFormOrgStep2 = ({
  handleCheckSchema,
}: SubmissionFormOrgStep2Props) => {
  const {
    control,
    // watch,
    formState: { errors },
  } = useFormContext<EventOCFormValues>();
  // const currentValues = getValues();

  return (
    <>
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
            "flex w-full grid-cols-[20%_auto] flex-col items-center lg:grid lg:gap-x-4 lg:gap-y-4",
            "self-start [&_.input-section:not(:first-of-type)]:mt-3 [&_.input-section:not(:first-of-type)]:lg:mt-0 [&_.input-section]:mb-2 [&_.input-section]:flex [&_.input-section]:w-full [&_.input-section]:items-start [&_.input-section]:gap-x-2 [&_.input-section]:lg:mb-0 [&_.input-section]:lg:mt-0 [&_.input-section]:lg:w-28 [&_.input-section]:lg:flex-col",
            "lg:pb-10 xl:py-10 4xl:my-auto",

            // "xl:self-center",
          )}
        >
          <div className="input-section self-start">
            <p className="min-w-max font-bold lg:text-xl">Step 1:</p>
            <p className="lg:text-xs">Organizer Links</p>
          </div>

          <div className="mx-auto flex w-full max-w-[74dvw] flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
            <Label htmlFor="event.category" className="sr-only">
              Organizer Links
            </Label>

            <FormLinksInput
              type="organization"
              handleCheckSchema={handleCheckSchema}
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
              "lg:pt-10 xl:py-10 4xl:my-auto",
              // "xl:self-center",
            )}
          >
            <div className="input-section">
              <p className="min-w-max font-bold lg:text-xl">Step 2</p>
              <p className="lg:text-xs">Primary Contact</p>
            </div>
            <div className="mx-auto flex w-full max-w-[74dvw] flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
              <Label
                htmlFor="organization.contact.organizer"
                className="sr-only"
              >
                Primary organizer contact
              </Label>
              <Controller
                name="organization.contact.organizer"
                control={control}
                render={({ field }) => (
                  // <Input
                  //   id="event.location"
                  //   value={field.value || ""}
                  //   onChange={field.onChange}
                  //   tabIndex={2}
                  //   placeholder="Name of primary contact"
                  //   className="mb-3 w-full rounded-lg border-foreground disabled:opacity-50 lg:mb-0"
                  // />
                  <DebouncedControllerInput
                    field={field}
                    placeholder="Name of primary contact"
                    className={cn(
                      "w-full rounded border-foreground",
                      errors?.organization?.contact?.organizer &&
                        "invalid-field",
                    )}
                    tabIndex={2}
                    onBlur={() => {
                      field.onBlur?.();
                      handleCheckSchema?.();
                      // console.log("Blur me", field + type)
                    }}
                  />
                )}
              />
            </div>
            <div className="input-section h-full">
              <p className="min-w-max font-bold lg:text-xl">Step 3:</p>
              <p className="lg:text-xs">Organizer - About</p>
            </div>

            <div className="mx-auto flex w-full max-w-[74dvw] flex-col gap-2 lg:min-w-[300px] lg:max-w-md">
              <Label htmlFor="organization.about" className="sr-only">
                Organizer - About
              </Label>

              <Controller
                name="organization.about"
                control={control}
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder="Add any info about your organization... "
                    charLimit={750}
                    purpose="organizerAbout"
                  />
                )}
              />
              <span className="w-full text-center text-xs italic text-muted-foreground">
                (Formatting is for preview and won&apos;t exactly match the
                public version)
              </span>
            </div>
          </div>
        </>
      </div>
    </>

    //   )}
  );
};

export default SubmissionFormOrgStep2;
