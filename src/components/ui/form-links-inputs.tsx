import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  autoHttps,
  formatFacebookInput,
  formatHandleInput,
  PlatformType,
} from "@/lib/linkFns";
import { cn } from "@/lib/utils";
import { HiArrowTurnRightDown } from "react-icons/hi2";

import { DebouncedControllerInput } from "@/components/ui/debounced-form-input";
import { EventOCFormValues } from "@/features/events/event-add-form";
import { ValidLinkPath } from "@/features/organizers/schemas/event-add-schema";
import { useDevice } from "@/providers/device-provider";
import { Control, Controller, useFormContext, useWatch } from "react-hook-form";
import {
  FaEnvelope,
  FaFacebook,
  FaGlobe,
  FaInstagram,
  FaLink,
  FaLinkedin,
  FaPhone,
  FaPlus,
  FaThreads,
  FaVk,
  FaYoutube,
} from "react-icons/fa6";
import PhoneInput, { Country } from "react-phone-number-input";
import "react-phone-number-input/style.css";

type FormLinksInputProps = {
  existingOrgHasLinks?: boolean;
  type: "event" | "organization";
  handleCheckSchema?: () => void;
  dashBoardView?: boolean;
};

const handleFields: {
  key: string;
  icon: React.ReactNode;
  platform: PlatformType;
  placeholder: { event: string; org: string };
  primaryOption: boolean;
}[] = [
  {
    key: "instagram",
    icon: <FaInstagram className={cn("size-5 shrink-0")} />,
    platform: "instagram",
    placeholder: {
      event: "@eventname",
      org: "@organizer",
    },
    primaryOption: true,
  },
  {
    key: "facebook",
    icon: <FaFacebook className={cn("size-5 shrink-0")} />,
    platform: "facebook",
    placeholder: { event: "@eventname", org: "@organizer" },
    primaryOption: true,
  },
  {
    key: "threads",
    icon: <FaThreads className={cn("size-5 shrink-0")} />,
    platform: "threads",
    placeholder: { event: "@eventname", org: "@organizer" },
    primaryOption: true,
  },
  {
    key: "youTube",
    icon: <FaYoutube className={cn("size-5 shrink-0")} />,
    platform: "youTube",
    placeholder: { event: "youtube.com/...", org: "youtube.com/..." },
    primaryOption: false,
  },
  {
    key: "vk",
    icon: <FaVk className={cn("size-5 shrink-0")} />,
    platform: "vk",
    placeholder: { event: "@eventname", org: "@organizer" },
    primaryOption: true,
  },
];

export const FormLinksInput = ({
  existingOrgHasLinks,
  type,
  handleCheckSchema,
  dashBoardView,
}: FormLinksInputProps) => {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<EventOCFormValues>();
  const { isMobile } = useDevice();

  const isEvent = type === "event";
  const isOrg = type === "organization";
  const eventData = watch("event");
  const organization = watch("organization");
  const primaryField = watch("organization.contact.primaryContact");
  const eventSameAsOrg = eventData?.links?.sameAsOrganizer;
  const eventCountry = eventData?.location?.countryAbbr;
  const hideLinks = isEvent && eventSameAsOrg;
  const eventPhone = eventData?.links?.phone;
  const orgPhone = organization?.links?.phone;

  return (
    <>
      <div
        className={cn(
          "flex max-w-[80dvw] flex-col gap-y-2",
          dashBoardView && "max-w-full",
        )}
      >
        {existingOrgHasLinks && isEvent && (
          <Controller
            name="event.links.sameAsOrganizer"
            control={control}
            render={({ field }) => (
              <Label className="mx-auto mb-4 flex w-full cursor-pointer items-center justify-center gap-2 border-b-2 border-dashed border-foreground/30 pb-4 pt-2">
                <Checkbox
                  id="linksSameAsOrganizer"
                  checked={field.value || false}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    if (checked) {
                      setValue("event.links.sameAsOrganizer", true);
                    }
                  }}
                />
                <span className="text-sm">Use same links as organization</span>
              </Label>
            )}
          />
        )}

        {isOrg && (
          <div className="mb-1 flex items-center justify-end gap-2 text-base text-muted-foreground">
            Primary Contact - Choose One(*)
            <HiArrowTurnRightDown className="size-4 shrink-0 translate-y-1.5" />
          </div>
        )}
        {/* Static fields */}
        <div
          className={cn(
            isEvent && "overflow-hidden p-0.5",
            !hideLinks && "mb-2",
          )}
        >
          <div
            key="input-fields"
            className={cn(
              "flex w-full origin-top flex-col gap-y-2 transition-all duration-300 ease-in-out",
              hideLinks && "links-hidden",
            )}
          >
            {isOrg ? (
              <Controller
                name="organization.contact.primaryContact"
                control={control}
                render={({ field: primaryFieldControl }) => (
                  <div className="flex items-center gap-x-4">
                    <FaGlobe
                      className={cn(
                        "size-5 shrink-0",

                        primaryField === "website" && "text-emerald-600",
                      )}
                    />
                    <Controller
                      name={`${type}.links.website`}
                      control={control}
                      render={({ field }) => (
                        <DebouncedControllerInput
                          field={field}
                          placeholder="organization website"
                          className={cn(
                            "flex-1",
                            errors?.[type]?.links?.website && "invalid-field",
                          )}
                          transform={autoHttps}
                          onBlur={() => {
                            field.onBlur?.();
                            handleCheckSchema?.();
                            // console.log("Blur me", field + type)
                          }}
                        />
                      )}
                    />

                    <Input
                      type="radio"
                      disabled={!organization?.links?.website}
                      name="primaryContact"
                      value="website"
                      checked={primaryField === "website"}
                      onChange={() => primaryFieldControl.onChange("website")}
                    />
                  </div>
                )}
              />
            ) : (
              <div className="flex items-center gap-x-4">
                <FaGlobe className={cn("size-5 shrink-0")} />
                <Controller
                  name={`${type}.links.website`}
                  control={control}
                  render={({ field }) => (
                    <DebouncedControllerInput
                      disabled={eventSameAsOrg && isEvent}
                      field={field}
                      placeholder="event website"
                      className={cn(
                        "flex-1",
                        errors?.[type]?.links?.website && "invalid-field",
                      )}
                      transform={autoHttps}
                      onBlur={() => {
                        field.onBlur?.();
                        handleCheckSchema?.();
                      }}
                    />
                  )}
                />
              </div>
            )}

            {isOrg ? (
              <Controller
                name="organization.contact.primaryContact"
                control={control}
                render={({ field: primaryFieldControl }) => (
                  <div className="flex items-center gap-x-4">
                    <FaEnvelope
                      className={cn(
                        "size-5 shrink-0",
                        primaryField === "email" && "text-emerald-600",
                      )}
                    />
                    <Controller
                      name={`${type}.links.email`}
                      control={control}
                      render={({ field }) => (
                        <DebouncedControllerInput
                          field={field}
                          placeholder="example@email.com (*required)"
                          className={cn(
                            "flex-1",
                            errors?.[type]?.links?.email && "invalid-field",
                          )}
                          onBlur={() => {
                            field.onBlur?.();
                            handleCheckSchema?.();
                            // console.log("Blur me", field + type)
                          }}
                        />
                      )}
                    />
                    {isOrg && (
                      <Input
                        type="radio"
                        disabled={!organization?.links?.email}
                        name="primaryContact"
                        value="email"
                        checked={primaryField === "email"}
                        onChange={() => primaryFieldControl.onChange("email")}
                      />
                    )}
                  </div>
                )}
              />
            ) : (
              <div className="flex items-center gap-x-4">
                <FaEnvelope className={cn("size-5 shrink-0")} />
                <Controller
                  name={`${type}.links.email`}
                  control={control}
                  render={({ field }) => (
                    <DebouncedControllerInput
                      disabled={eventSameAsOrg && isEvent}
                      field={field}
                      placeholder="example@email.com"
                      className={cn(
                        "flex-1",
                        errors?.[type]?.links?.email && "invalid-field",
                      )}
                      onBlur={() => {
                        field.onBlur?.();
                        handleCheckSchema?.();
                      }}
                    />
                  )}
                />
              </div>
            )}

            {isOrg ? (
              <Controller
                name="organization.contact.primaryContact"
                control={control}
                render={({ field: primaryFieldControl }) => (
                  <div
                    className={cn(
                      "flex items-center gap-x-4",
                      orgPhone && "items-start",
                    )}
                  >
                    <FaPhone
                      className={cn(
                        "size-5 shrink-0",
                        primaryField === "phone" && "text-emerald-600",
                        orgPhone && "mt-2.5",
                      )}
                    />
                    <div className={cn("flex w-full flex-col gap-3")}>
                      <Controller
                        name={`${type}.links.phone`}
                        control={control}
                        render={({ field }) => (
                          <PhoneInput
                            {...field}
                            international
                            defaultCountry={(eventCountry as Country) || "US"}
                            value={field.value ?? ""}
                            placeholder="+1 (555) 555-5555"
                            className={cn(
                              "flex h-10 w-full min-w-[10.5rem] flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm [&>input:disabled]:cursor-not-allowed [&>input:disabled]:bg-white [&>input:disabled]:opacity-50",
                              errors?.[type]?.links?.phone && "invalid-field",
                            )}
                            onChange={field.onChange}
                            onBlur={() => {
                              field.onBlur?.();
                              handleCheckSchema?.();
                              // console.log("Blur me", field + type)
                            }}
                          />
                        )}
                      />
                      <div
                        className={cn(
                          "flex items-center gap-x-2",
                          !orgPhone && "hidden",
                        )}
                      >
                        <p className="text-sm">
                          {isMobile ? "Ext:" : "Extension:"}
                        </p>
                        <Controller
                          name={`${type}.links.phoneExt`}
                          control={control}
                          render={({ field }) => (
                            <DebouncedControllerInput
                              disabled={eventSameAsOrg && isEvent}
                              field={field}
                              placeholder="ex. 1234 (optional)"
                              className={cn(
                                "w-full",
                                errors?.[type]?.links?.phoneExt &&
                                  "invalid-field",
                              )}
                              onBlur={() => {
                                field.onBlur?.();
                                handleCheckSchema?.();
                              }}
                            />
                          )}
                        />
                      </div>
                    </div>

                    <Input
                      type="radio"
                      disabled={!organization?.links?.phone}
                      name="primaryContact"
                      value="phone"
                      checked={primaryField === "phone"}
                      onChange={() => primaryFieldControl.onChange("phone")}
                      labelClassName={cn(orgPhone && "mt-2.5")}
                      // className={cn(orgPhone && "mt-2.5")}
                    />
                  </div>
                )}
              />
            ) : (
              <div
                className={cn(
                  "flex items-center gap-x-4",
                  eventPhone && "items-start",
                )}
              >
                {" "}
                <FaPhone
                  className={cn("size-5 shrink-0", eventPhone && "mt-2.5")}
                />
                <div className={cn("flex w-full flex-col gap-3")}>
                  <Controller
                    name={`${type}.links.phone`}
                    control={control}
                    render={({ field }) => (
                      <PhoneInput
                        {...field}
                        disabled={eventSameAsOrg && isEvent}
                        international
                        defaultCountry={(eventCountry as Country) || "US"}
                        value={field.value ?? ""}
                        placeholder="+1 (555) 555-5555"
                        className={cn(
                          "flex h-10 w-full min-w-[10.5rem] flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm [&>input:disabled]:cursor-not-allowed [&>input:disabled]:bg-white [&>input:disabled]:opacity-50",
                          errors?.[type]?.links?.phone && "invalid-field",
                        )}
                        onChange={field.onChange}
                        onBlur={() => {
                          field.onBlur?.();
                          handleCheckSchema?.();
                        }}
                      />
                    )}
                  />
                  <div
                    className={cn(
                      "flex items-center gap-x-2",
                      !eventPhone && "hidden",
                    )}
                  >
                    <p className="text-sm">
                      {isMobile ? "Ext:" : "Extension:"}
                    </p>
                    <Controller
                      name={`${type}.links.phoneExt`}
                      control={control}
                      render={({ field }) => (
                        <DebouncedControllerInput
                          disabled={eventSameAsOrg && isEvent}
                          field={field}
                          placeholder="ex. 1234 (optional)"
                          className={cn(
                            "w-full",
                            errors?.[type]?.links?.phoneExt && "invalid-field",
                          )}
                          onBlur={() => {
                            field.onBlur?.();
                            handleCheckSchema?.();
                          }}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

            {isEvent && (
              <div className="flex items-center gap-x-4">
                <FaLink className={cn("size-5 shrink-0")} />
                <Controller
                  name="event.links.linkAggregate"
                  control={control}
                  render={({ field }) => (
                    <DebouncedControllerInput
                      disabled={eventSameAsOrg && isEvent}
                      field={field}
                      placeholder="linktree (or similar)"
                      className={cn(
                        "flex-1",
                        errors?.[type]?.links?.linkAggregate && "invalid-field",
                      )}
                      transform={autoHttps}
                      onBlur={() => {
                        field.onBlur?.();
                        handleCheckSchema?.();
                      }}
                    />
                  )}
                />
              </div>
            )}
            {isOrg ? (
              <Controller
                name="organization.contact.primaryContact"
                control={control}
                render={({ field: primaryFieldControl }) => (
                  <>
                    {/* Debounced handle fields */}
                    {handleFields.map(
                      ({ key, icon, platform, placeholder, primaryOption }) => {
                        const name =
                          `organization.links.${key}` as ValidLinkPath;

                        return (
                          <HandleInput
                            key={name}
                            control={control}
                            name={name}
                            platform={platform}
                            icon={icon}
                            placeholder={placeholder.org}
                            primaryOption={primaryOption}
                            isOrg={true}
                            primaryField={primaryField}
                            onPrimaryChange={primaryFieldControl.onChange}
                          />
                        );
                      },
                    )}
                  </>
                )}
              />
            ) : (
              <>
                {/* Debounced handle fields */}
                {handleFields.map(({ key, icon, platform, placeholder }) => {
                  const name = `event.links.${key}` as ValidLinkPath;

                  return (
                    <HandleInput
                      key={name}
                      control={control}
                      name={name}
                      platform={platform}
                      icon={icon}
                      placeholder={placeholder.event}
                      disabled={eventSameAsOrg && isEvent}
                      primaryField={primaryField}
                      handleCheckSchema={handleCheckSchema}
                    />
                  );
                })}
              </>
            )}
            {isOrg && (
              <div className="flex items-center gap-x-4">
                <FaLinkedin className={cn("size-5 shrink-0")} />
                <Controller
                  name="organization.links.linkedIn"
                  control={control}
                  render={({ field }) => (
                    <DebouncedControllerInput
                      disabled={eventSameAsOrg && isEvent}
                      field={field}
                      placeholder="linkedIn"
                      className={cn(
                        "flex-1",
                        errors?.[type]?.links?.linkedIn && "invalid-field",
                      )}
                      transform={autoHttps}
                      onBlur={() => {
                        field.onBlur?.();
                        handleCheckSchema?.();
                      }}
                    />
                  )}
                />
              </div>
            )}
            {isOrg && (
              <div className="flex items-center gap-x-4">
                <FaLink className={cn("size-5 shrink-0")} />
                <Controller
                  name="organization.links.linkAggregate"
                  control={control}
                  render={({ field }) => (
                    <DebouncedControllerInput
                      disabled={eventSameAsOrg && isEvent}
                      field={field}
                      placeholder="linktree (or similar)"
                      className={cn(
                        "flex-1",
                        errors?.[type]?.links?.linkAggregate && "invalid-field",
                      )}
                      transform={autoHttps}
                      onBlur={() => {
                        field.onBlur?.();
                        handleCheckSchema?.();
                      }}
                    />
                  )}
                />
              </div>
            )}

            <div className="flex items-center gap-x-4">
              <FaPlus className={cn("size-5 shrink-0")} />
              <Controller
                name={`${type}.links.other`}
                control={control}
                render={({ field }) => (
                  <DebouncedControllerInput
                    disabled={eventSameAsOrg && isEvent}
                    field={field}
                    placeholder="other links..."
                    className={cn(
                      "flex-1",
                      errors?.[type]?.links?.other && "invalid-field",
                    )}
                    transform={autoHttps}
                    onBlur={() => {
                      field.onBlur?.();
                      handleCheckSchema?.();
                    }}
                  />
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

type HandleInputProps = {
  control: Control<EventOCFormValues>;
  name: ValidLinkPath;
  platform: PlatformType;
  icon: React.ReactNode;
  placeholder: string;
  primaryOption?: boolean;
  disabled?: boolean;
  isOrg?: boolean;
  primaryField?: string;
  onPrimaryChange?: (value: string) => void;
  handleCheckSchema?: () => void;
};

function HandleInput({
  control,
  name,
  platform,
  icon,
  placeholder,
  primaryOption,
  disabled,
  isOrg,
  primaryField,
  onPrimaryChange,
  handleCheckSchema,
}: HandleInputProps) {
  const fieldKey = name.split(".").pop();
  const watched = useWatch({ control, name });
  const { getFieldState } = useFormContext<EventOCFormValues>();
  const { error } = getFieldState(name);

  return (
    <div className="flex items-center gap-x-4">
      {icon}
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          return (
            <DebouncedControllerInput
              field={field}
              disabled={disabled}
              placeholder={placeholder}
              className={cn("flex-1", error && "invalid-field")}
              // transform={(val) => formatHandleInput(val, platform)}
              transform={(val) => {
                if (platform === "facebook") {
                  return formatFacebookInput(val);
                } else if (platform === "youTube") {
                  return autoHttps(val);
                }
                return formatHandleInput(val, platform);
              }}
              onBlur={() => {
                field.onBlur?.();
                handleCheckSchema?.();
              }}
            />
          );
        }}
      />
      {isOrg && fieldKey && primaryOption && (
        <Input
          type="radio"
          disabled={typeof watched !== "string" || !watched.trim()}
          name="primaryContact"
          value={fieldKey}
          checked={primaryField === fieldKey}
          onChange={() => onPrimaryChange?.(fieldKey)}
        />
      )}
    </div>
  );
}
