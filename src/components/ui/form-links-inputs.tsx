import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatHandleInput, PlatformType } from "@/lib/linkFns";
import { cn } from "@/lib/utils";
import { debounce } from "lodash";
import { useEffect, useRef, useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import {
  FaEnvelope,
  FaFacebook,
  FaGlobe,
  FaInstagram,
  FaLink,
  FaPhone,
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
  name: `event.links.${string}`;
  icon: React.ReactNode;
  platform: PlatformType;
  placeholder: string;
}[] = [
  {
    name: "event.links.instagram",
    icon: <FaInstagram className="size-5" />,
    platform: "instagram",
    placeholder: "@eventname",
  },
  {
    name: "event.links.facebook",
    icon: <FaFacebook className="size-5" />,
    platform: "facebook",
    placeholder: "@eventname",
  },
  {
    name: "event.links.threads",
    icon: <FaThreads className="size-5" />,
    platform: "threads",
    placeholder: "@eventname",
  },
  {
    name: "event.links.vk",
    icon: <FaVk className="size-5" />,
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
  const eventData = watch("event");
  const eventCountry = eventData?.location?.countryAbbr;
  return (
    <div className={cn("flex flex-col gap-y-2")}>
      {existingOrgHasLinks && isEvent && (
        <Controller
          name="event.links.sameAsOrganizer"
          control={control}
          render={({ field }) => (
            <Label className="mx-auto flex cursor-pointer items-center gap-2 py-2">
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

      {/* Static fields */}
      <div className="flex items-center gap-x-2">
        <FaGlobe className="size-5" />
        <Controller
          name="event.links.website"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              value={field.value ?? ""}
              placeholder="event website"
              className="w-full"
            />
          )}
        />
      </div>

      <div className="flex items-center gap-x-2">
        <FaEnvelope className="size-5" />
        <Controller
          name="event.links.email"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              value={field.value ?? ""}
              placeholder="example@email.com"
              className="w-full"
            />
          )}
        />
      </div>

      <div className="flex items-center gap-x-2">
        <FaPhone className="size-5" />
        <Controller
          name="event.links.phone"
          control={control}
          render={({ field }) => (
            // <Input
            //   {...field}
            //   value={field.value ?? ""}
            //   placeholder="+1 (555) 555-5555"
            //   className="w-full"
            // />
            <PhoneInput
              {...field}
              international
              defaultCountry={eventCountry || "US"}
              value={field.value ?? ""}
              placeholder="+1 (555) 555-5555"
              className="w-full"
              onChange={field.onChange}
            />
          )}
        />
      </div>

      <div className="flex items-center gap-x-2">
        <FaLink className="size-5" />
        <Controller
          name="event.links.linkAggregate"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              value={field.value ?? ""}
              placeholder="linktree (or similar)"
              className="w-full"
            />
          )}
        />
      </div>

      {/* Debounced handle fields */}
      {handleFields.map(({ name, icon, platform, placeholder }) => (
        <HandleInput
          key={name}
          control={control}
          name={name}
          platform={platform}
          icon={icon}
          placeholder={placeholder}
        />
      ))}
    </div>
  );
};

type HandleInputProps = {
  control: ReturnType<typeof useFormContext>["control"];
  name: `event.links.${string}`;
  platform: PlatformType;
  icon: React.ReactNode;
  placeholder: string;
};

function HandleInput({
  control,
  name,
  platform,
  icon,
  placeholder,
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

  return (
    <div className="flex items-center gap-x-2">
      {icon}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Input
            value={inputVal}
            placeholder={placeholder}
            className="w-full"
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
    </div>
  );
}
