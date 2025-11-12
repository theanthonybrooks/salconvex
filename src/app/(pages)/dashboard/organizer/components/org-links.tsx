import { Controller, useFormContext } from "react-hook-form";
import PhoneInput, { Country } from "react-phone-number-input";

import {
  FaEnvelope,
  FaGlobe,
  FaLink,
  FaLinkedin,
  FaPhone,
  FaPlus,
} from "react-icons/fa6";
import { HiArrowTurnRightDown } from "react-icons/hi2";

import { DebouncedControllerInput } from "@/components/ui/debounced-form-input";
import { handleFields, HandleInput } from "@/components/ui/form-links-inputs";
import { Input } from "@/components/ui/input";
import { type OrgLinkField } from "@/features/organizers/schemas/event-add-schema";
import { autoHttps } from "@/helpers/linkFns";
import { cn } from "@/helpers/utilsFns";
import { useDevice } from "@/providers/device-provider";

import "react-phone-number-input/style.css";

import type { OrganizationValues } from "@/schemas/organizer";

import { useState } from "react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";

type FormLinksInputProps = {
  handleCheckSchema?: () => void;
  dashBoardView?: boolean;
};

export type OrgLinkPath = `links.${OrgLinkField}`;

export const OrgLinksInput = ({
  handleCheckSchema,
  dashBoardView,
}: FormLinksInputProps) => {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext<OrganizationValues>();
  const [isExpanded, setIsExpanded] = useState(false);

  const { isMobile } = useDevice();
  const links = watch("links");
  const location = watch("location");
  const primaryField = watch("contact.primaryContact");
  const orgPhone = links?.phone;
  const orgCountry = location?.countryAbbr;
  return (
    <>
      <div
        className={cn(
          "flex max-w-[80dvw] flex-col gap-y-2",
          dashBoardView && "max-w-full",
        )}
      >
        <div className="mb-1 flex items-center justify-end gap-2 text-base text-muted-foreground">
          Primary Contact - Required(*)
          <HiArrowTurnRightDown className="size-4 shrink-0 translate-y-1.5" />
        </div>

        {/* Static fields */}

        <motion.div
          key="input-fields"
          className={cn(
            "flex w-full origin-top flex-col gap-y-2 transition-all duration-300 ease-in-out",
          )}
        >
          <Controller
            name="contact.primaryContact"
            control={control}
            render={({ field: primaryFieldControl }) => {
              const visibleField = "website" === primaryField;
              return (
                <div
                  className={cn(
                    "hidden items-center gap-x-4",
                    (visibleField || isExpanded) && "flex",
                  )}
                >
                  <FaGlobe
                    className={cn(
                      "size-5 shrink-0",

                      primaryField === "website" && "text-emerald-600",
                    )}
                  />
                  <Controller
                    name="links.website"
                    control={control}
                    render={({ field }) => (
                      <DebouncedControllerInput
                        field={field}
                        placeholder="organization website"
                        className={cn(
                          "flex-1",
                          errors?.links?.website && "invalid-field",
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
                    disabled={!links?.website}
                    name="primaryContact"
                    value="website"
                    checked={primaryField === "website"}
                    onChange={() => primaryFieldControl.onChange("website")}
                  />
                </div>
              );
            }}
          />

          <Controller
            name="contact.primaryContact"
            control={control}
            render={({ field: primaryFieldControl }) => {
              const visibleField = "email" === primaryField;
              return (
                <div
                  className={cn(
                    "hidden items-center gap-x-4",
                    (visibleField || isExpanded) && "flex",
                  )}
                >
                  <FaEnvelope
                    className={cn(
                      "size-5 shrink-0",
                      primaryField === "email" && "text-emerald-600",
                    )}
                  />
                  <Controller
                    name="links.email"
                    control={control}
                    render={({ field }) => (
                      <DebouncedControllerInput
                        field={field}
                        placeholder="example@email.com (*required)"
                        className={cn(
                          "flex-1",
                          errors?.links?.email && "invalid-field",
                        )}
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
                    disabled={!links?.email}
                    name="primaryContact"
                    value="email"
                    checked={primaryField === "email"}
                    onChange={() => primaryFieldControl.onChange("email")}
                  />
                </div>
              );
            }}
          />

          <Controller
            name="contact.primaryContact"
            control={control}
            render={({ field: primaryFieldControl }) => {
              const isPrimaryField = "phone" === primaryField;

              return (
                <div
                  className={cn(
                    "hidden items-center gap-x-4",
                    (isPrimaryField || isExpanded) && "flex",
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
                      name="links.phone"
                      control={control}
                      render={({ field }) => (
                        <PhoneInput
                          {...field}
                          international
                          defaultCountry={(orgCountry as Country) || "US"}
                          value={field.value ?? ""}
                          placeholder="+1 (555) 555-5555"
                          className={cn(
                            "flex h-10 w-full min-w-[10.5rem] flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm [&>input:disabled]:cursor-not-allowed [&>input:disabled]:bg-white [&>input:disabled]:opacity-50",
                            // fontSize stuff, use "lg-text",
                            errors?.links?.phone && "invalid-field",
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
                        name="links.phoneExt"
                        control={control}
                        render={({ field }) => (
                          <DebouncedControllerInput
                            field={field}
                            placeholder="ex. 1234 (optional)"
                            className={cn(
                              "w-full",
                              errors?.links?.phoneExt && "invalid-field",
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
                    disabled={!links?.phone}
                    name="primaryContact"
                    value="phone"
                    checked={primaryField === "phone"}
                    onChange={() => primaryFieldControl.onChange("phone")}
                    labelClassName={cn(orgPhone && "mt-2.5")}
                    // className={cn(orgPhone && "mt-2.5")}
                  />
                </div>
              );
            }}
          />

          <Controller
            name="contact.primaryContact"
            control={control}
            render={({ field: primaryFieldControl }) => {
              return (
                <>
                  {/* Debounced handle fields */}
                  {handleFields.map(
                    ({ key, icon, platform, placeholder, primaryOption }) => {
                      const name = `links.${key}` as OrgLinkPath;
                      const isVisibleField = key === primaryField;

                      return (
                        <HandleInput
                          className={cn(
                            "hidden",
                            (isVisibleField || isExpanded) && "flex",
                          )}
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
              );
            }}
          />

          <div
            className={cn("flex items-center gap-x-4", !isExpanded && "hidden")}
          >
            <FaLinkedin className={cn("size-5 shrink-0")} />
            <Controller
              name="links.linkedIn"
              control={control}
              render={({ field }) => (
                <DebouncedControllerInput
                  field={field}
                  placeholder="linkedIn"
                  className={cn(
                    "flex-1",
                    errors?.links?.linkedIn && "invalid-field",
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

          <div
            className={cn("flex items-center gap-x-4", !isExpanded && "hidden")}
          >
            <FaLink className={cn("size-5 shrink-0")} />
            <Controller
              name="links.linkAggregate"
              control={control}
              render={({ field }) => (
                <DebouncedControllerInput
                  field={field}
                  placeholder="linktree (or similar)"
                  className={cn(
                    "flex-1",
                    errors?.links?.linkAggregate && "invalid-field",
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

          <div
            className={cn("flex items-center gap-x-4", !isExpanded && "hidden")}
          >
            <FaPlus className={cn("size-5 shrink-0")} />
            <Controller
              name="links.other"
              control={control}
              render={({ field }) => (
                <DebouncedControllerInput
                  field={field}
                  placeholder="other links..."
                  className={cn(
                    "flex-1",
                    errors?.links?.other && "invalid-field",
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
          <Button
            onClick={() => setIsExpanded((prev) => !prev)}
            variant="link"
            // className="hover:scale-100 hover:underline"
          >
            {isExpanded ? "View less" : "View Full Links"}
          </Button>
        </motion.div>
      </div>
    </>
  );
};
