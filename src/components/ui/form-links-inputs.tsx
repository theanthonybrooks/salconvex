import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { autoHttps, formatHandleInput, PlatformType } from "@/lib/linkFns";
import { cn } from "@/lib/utils";
import { debounce } from "lodash";
import { HiArrowTurnRightDown } from "react-icons/hi2";

import { useEffect, useRef, useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
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
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

type FormLinksInputProps = {
  existingOrgHasLinks?: boolean;
  type: "event" | "organization";
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
}: FormLinksInputProps) => {
  const { control, watch, setValue } = useFormContext();
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
        {(existingOrgHasLinks || eventSameAsOrg) && isEvent && (
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
          <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
            Primary Contact - Choose One (required)
            <HiArrowTurnRightDown className="size-4 shrink-0 translate-y-1.5" />
          </div>
        )}
        {/* Static fields */}
        <div className={cn(isEvent && "overflow-hidden", !hideLinks && "mb-2")}>
          <div
            key="input-fields"
            className={cn(
              "flex w-full origin-top flex-col gap-y-2 transition-all duration-300 ease-in-out",
              hideLinks && "links-hidden",
            )}
          >
            <Controller
              name="organization.contact.primaryContact"
              control={control}
              render={({ field: primaryFieldControl }) => (
                <div className="flex items-center gap-x-2">
                  <FaGlobe
                    className={cn(
                      "size-5 shrink-0",
                      isOrg && primaryField === "website" && "text-emerald-600",
                    )}
                  />
                  <Controller
                    name={`${type}.links.website`}
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        disabled={eventSameAsOrg && isEvent}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(autoHttps(e.target.value))
                        }
                        placeholder={
                          isEvent ? "event website" : "organization website"
                        }
                        className="flex-1"
                      />
                    )}
                  />
                  {isOrg && (
                    <Input
                      type="radio"
                      disabled={!organization?.links?.website}
                      name="primaryContact"
                      value="website"
                      checked={primaryField === "website"}
                      onChange={() => primaryFieldControl.onChange("website")}
                    />
                  )}
                </div>
              )}
            />

            <Controller
              name="organization.contact.primaryContact"
              control={control}
              render={({ field: primaryFieldControl }) => (
                <div className="flex items-center gap-2">
                  <FaEnvelope
                    className={cn(
                      "size-5 shrink-0",
                      isOrg && primaryField === "email" && "text-emerald-600",
                    )}
                  />
                  <Controller
                    name={`${type}.links.email`}
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        disabled={eventSameAsOrg && isEvent}
                        value={field.value ?? ""}
                        placeholder="example@email.com"
                        className="flex-1"
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

            <Controller
              name="organization.contact.primaryContact"
              control={control}
              render={({ field: primaryFieldControl }) => (
                <div className="flex items-center gap-x-2">
                  <FaPhone
                    className={cn(
                      "size-5 shrink-0",
                      isOrg && primaryField === "phone" && "text-emerald-600",
                    )}
                  />
                  <Controller
                    name={`${type}.links.phone`}
                    control={control}
                    render={({ field }) => (
                      <PhoneInput
                        {...field}
                        disabled={eventSameAsOrg && isEvent}
                        international
                        defaultCountry={eventCountry || "US"}
                        value={field.value ?? ""}
                        placeholder="+1 (555) 555-5555"
                        className="flex h-10 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-[16px] text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm [&>input:disabled]:cursor-not-allowed [&>input:disabled]:bg-white [&>input:disabled]:opacity-50"
                        onChange={field.onChange}
                      />
                    )}
                  />
                  {isOrg && (
                    <Input
                      type="radio"
                      disabled={!organization?.links?.phone}
                      name="primaryContact"
                      value="phone"
                      checked={primaryField === "phone"}
                      onChange={() => primaryFieldControl.onChange("phone")}
                    />
                  )}
                </div>
              )}
            />
            {isEvent && (
              <div className="flex items-center gap-x-2">
                <FaLink className={cn("size-5 shrink-0")} />
                <Controller
                  name="event.links.linkAggregate"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      disabled={eventSameAsOrg && isEvent}
                      value={field.value ?? ""}
                      placeholder="linktree (or similar)"
                      className="flex-1"
                      onChange={(e) =>
                        field.onChange(autoHttps(e.target.value))
                      }
                    />
                  )}
                />
              </div>
            )}
            <Controller
              name="organization.contact.primaryContact"
              control={control}
              render={({ field: primaryFieldControl }) => (
                <>
                  {/* Debounced handle fields */}
                  {handleFields.map(({ key, icon, platform, placeholder }) => {
                    const name = `${type}.links.${key}` as
                      | `event.links.${string}`
                      | `organization.links.${string}`;
                    return (
                      <HandleInput
                        key={name}
                        control={control}
                        name={name}
                        platform={platform}
                        icon={icon}
                        placeholder={placeholder}
                        disabled={eventSameAsOrg && isEvent}
                        isOrg={isOrg}
                        primaryField={primaryField}
                        onPrimaryChange={primaryFieldControl.onChange}
                      />
                    );
                  })}
                </>
              )}
            />
            {isOrg && (
              <div className="flex items-center gap-x-2">
                <FaLink className={cn("size-5 shrink-0")} />
                <Controller
                  name="organization.links.linkAggregate"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      disabled={eventSameAsOrg && isEvent}
                      value={field.value ?? ""}
                      placeholder="linktree (or similar)"
                      className="flex-1"
                      onChange={(e) =>
                        field.onChange(autoHttps(e.target.value))
                      }
                    />
                  )}
                />
              </div>
            )}

            <div className="flex items-center gap-x-2">
              <FaPlus className={cn("size-5 shrink-0")} />
              <Controller
                name={`${type}.links.other`}
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    disabled={eventSameAsOrg && isEvent}
                    value={field.value ?? ""}
                    placeholder="any other link not listed above"
                    className="flex-1"
                    onChange={(e) => field.onChange(autoHttps(e.target.value))}
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
  control: ReturnType<typeof useFormContext>["control"];
  name: `event.links.${string}` | `organization.links.${string}`;
  platform: PlatformType;
  icon: React.ReactNode;
  placeholder: string;
  disabled?: boolean;
  isOrg?: boolean;
  primaryField?: string;
  onPrimaryChange?: (value: string) => void;
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
}: HandleInputProps) {
  const watched = useWatch({ control, name });
  const [inputVal, setInputVal] = useState(watched ?? "");

  const debounced = useRef(
    debounce((raw: string, onChange: (val: string) => void) => {
      onChange(formatHandleInput(raw, platform));
    }, 500),
  ).current;

  useEffect(() => {
    setInputVal(watched ?? "");
  }, [watched]);

  const fieldKey = name.split(".").pop();

  return (
    <div className="flex items-center gap-x-2">
      {icon}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Input
            disabled={disabled}
            value={inputVal}
            placeholder={placeholder}
            className="flex-1"
            onChange={(e) => {
              const raw = e.target.value;
              setInputVal(raw);
              debounced(raw, field.onChange);
            }}
            onPaste={(e) => {
              e.preventDefault();
              const pasted = e.clipboardData.getData("text");
              const formatted = formatHandleInput(pasted, platform);
              setInputVal(formatted);
              field.onChange(formatted);
            }}
          />
        )}
      />
      {isOrg && fieldKey && (
        <Input
          type="radio"
          disabled={!watched?.trim()}
          name="primaryContact"
          value={fieldKey}
          checked={primaryField === fieldKey}
          onChange={() => onPrimaryChange?.(fieldKey)}
        />
      )}
    </div>
  );
}
