import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { autoHttps, formatHandleInput, PlatformType } from "@/lib/linkFns";
import { cn } from "@/lib/utils";
import { HiArrowTurnRightDown } from "react-icons/hi2";

import { DebouncedControllerInput } from "@/components/ui/debounced-form-input";
import { EventOCFormValues } from "@/features/events/event-add-form";
import { ValidLinkPath } from "@/features/organizers/schemas/event-add-schema";
import { Control, Controller, useFormContext, useWatch } from "react-hook-form";
import {
  FaEnvelope,
  FaFacebook,
  FaGlobe,
  FaInstagram,
  FaLink,
  FaPhone,
  FaPlus,
  FaThreads,
  FaVk,
} from "react-icons/fa6";
import PhoneInput, { Country } from "react-phone-number-input";
import "react-phone-number-input/style.css";

type FormLinksInputProps = {
  existingOrgHasLinks?: boolean;
  type: "event" | "organization";
  handleCheckSchema?: () => void;
};

const handleFields: {
  key: string;
  icon: React.ReactNode;
  platform: PlatformType;
  placeholder: string;
}[] = [
  {
    key: "instagram",
    icon: <FaInstagram className={cn("size-5 shrink-0")} />,
    platform: "instagram",
    placeholder: "@eventname",
  },
  {
    key: "facebook",
    icon: <FaFacebook className={cn("size-5 shrink-0")} />,
    platform: "facebook",
    placeholder: "@eventname",
  },
  {
    key: "threads",
    icon: <FaThreads className={cn("size-5 shrink-0")} />,
    platform: "threads",
    placeholder: "@eventname",
  },
  {
    key: "vk",
    icon: <FaVk className={cn("size-5 shrink-0")} />,
    platform: "vk",
    placeholder: "@eventname",
  },
];

export const FormLinksInput = ({
  existingOrgHasLinks,
  type,
  handleCheckSchema,
}: FormLinksInputProps) => {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<EventOCFormValues>();
  const isEvent = type === "event";
  const isOrg = type === "organization";
  const eventData = watch("event");
  const organization = watch("organization");
  const primaryField = watch("organization.contact.primaryContact");
  const eventSameAsOrg = eventData?.links?.sameAsOrganizer;
  const eventCountry = eventData?.location?.countryAbbr;
  const hideLinks = isEvent && eventSameAsOrg;

  return (
    <>
      <div className={cn("flex max-w-[80dvw] flex-col gap-y-2")}>
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
              <div className="flex items-center gap-2">
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
                  <div className="flex items-center gap-x-4">
                    <FaPhone
                      className={cn(
                        "size-5 shrink-0",
                        primaryField === "phone" && "text-emerald-600",
                      )}
                    />
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
                            "flex h-10 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-[16px] text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm [&>input:disabled]:cursor-not-allowed [&>input:disabled]:bg-white [&>input:disabled]:opacity-50",
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

                    <Input
                      type="radio"
                      disabled={!organization?.links?.phone}
                      name="primaryContact"
                      value="phone"
                      checked={primaryField === "phone"}
                      onChange={() => primaryFieldControl.onChange("phone")}
                    />
                  </div>
                )}
              />
            ) : (
              <div className="flex items-center gap-x-4">
                <FaPhone className={cn("size-5 shrink-0")} />
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
                        "flex h-10 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-[16px] text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm [&>input:disabled]:cursor-not-allowed [&>input:disabled]:bg-white [&>input:disabled]:opacity-50",
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
                      ({ key, icon, platform, placeholder }) => {
                        const name =
                          `organization.links.${key}` as ValidLinkPath;

                        return (
                          <HandleInput
                            key={name}
                            control={control}
                            name={name}
                            platform={platform}
                            icon={icon}
                            placeholder={placeholder}
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
                      placeholder={placeholder}
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
                    className="flex-1"
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
            // <Input
            //   disabled={disabled}
            //   value={inputVal}
            //   placeholder={placeholder}
            //   className="flex-1"
            //   onChange={(e) => {
            //     const raw = e.target.value;
            //     setInputVal(raw);
            //     debounced(raw, field.onChange);
            //   }}
            //   onPaste={(e) => {
            //     e.preventDefault();
            //     const pasted = e.clipboardData.getData("text");
            //     const formatted = formatHandleInput(pasted, platform);
            //     setInputVal(formatted);
            //     field.onChange(formatted);
            //   }}
            // />
            <DebouncedControllerInput
              field={field}
              disabled={disabled}
              placeholder={placeholder}
              className={cn("flex-1", error && "invalid-field")}
              transform={(val) => formatHandleInput(val, platform)}
              onBlur={() => {
                field.onBlur?.();
                handleCheckSchema?.();
              }}
            />
          );
        }}
      />
      {isOrg && fieldKey && (
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
