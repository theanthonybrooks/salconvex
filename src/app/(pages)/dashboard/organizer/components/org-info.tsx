import { defaultOrg } from "@/constants/orgConsts";

import type { OrganizationValues } from "@/schemas/organizer";
import type { User } from "@/types/user";

import { useEffect, useMemo, useState } from "react";
import { OrgLinksInput } from "@/app/(pages)/dashboard/organizer/components/org-links";
import { organizationSchema } from "@/schemas/organizer";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import slugify from "slugify";

import { LoaderCircle } from "lucide-react";

import type { Doc, Id } from "~/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { DebouncedControllerInput } from "@/components/ui/debounced-form-input";
import { DebouncedFormTextarea } from "@/components/ui/debounced-form-textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import LogoUploader from "@/components/ui/logo-uploader";
import { MapboxInputFull } from "@/components/ui/mapbox-search";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/helpers/utilsFns";

import { api } from "~/convex/_generated/api";
import { useConvex, useMutation } from "convex/react";

// type OrgEventsData = FunctionReturnType<
//   typeof api.events.event.getEventByOrgId
// >;

type OrgInfoProps = {
  orgData?: Doc<"organizations">;
  user?: User;
};

export const OrgInfo = ({ orgData, user }: OrgInfoProps) => {
  const isAdmin = user?.role?.includes("admin");
  const [pending, setPending] = useState(false);

  const defaultValues = useMemo(
    () => ({
      name: orgData?.name || "",
      location: orgData?.location || defaultOrg.location,
      logo: orgData?.logo || "",
      links: orgData?.links || defaultOrg.links,
      blurb: orgData?.blurb || "",
      about: orgData?.about || "",
      contact: {
        organizer: orgData?.contact?.organizer || "",
        organizerTitle: orgData?.contact?.organizerTitle || "",
        primaryContact: orgData?.contact?.primaryContact || "",
      },
    }),
    [orgData],
  );

  const convex = useConvex();
  const generateUploadUrl = useMutation(api.uploads.files.generateUploadUrl);
  const updateOrg = useMutation(api.organizer.organizations.updateOrganization);
  const form = useForm<OrganizationValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues,
    mode: "onChange",
    delayError: 1000,
    shouldUnregister: true,
  });

  const {
    watch,
    handleSubmit,
    reset,

    formState: { isValid, isDirty, errors },
  } = form;
  // const formData = watch();

  if (Object.keys(errors).length > 0) console.log(errors);
  const organizerName = watch("contact.organizer");

  const onSubmit = async (values: OrganizationValues) => {
    if (!orgData) return;
    let logoStorageId = orgData.logoStorageId;
    let logoUrl = orgData.logo;

    setPending(true);
    try {
      if (values.logo && typeof values.logo !== "string") {
        const uploadUrl = await generateUploadUrl();
        const uploadRes = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": values.logo.type },
          body: values.logo,
        });

        if (!uploadRes.ok) {
          toast.error("Failed to upload logo", {
            autoClose: 2000,
            pauseOnHover: false,
            hideProgressBar: true,
          });
          return;
        }

        const { storageId } = await uploadRes.json();
        const urlResult = await convex.query(api.uploads.files.getFileUrl, {
          storageId,
        });
        logoStorageId = storageId;
        logoUrl = urlResult ?? orgData.logo;
      }
      const result = await updateOrg({
        orgId: orgData._id as Id<"organizations">,
        name: values.name,
        slug: slugify(values.name, { lower: true, strict: true }),
        logo: logoUrl,
        logoStorageId,
        location: {
          ...values.location,
          country: values.location?.country ?? "",
          countryAbbr: values.location?.countryAbbr ?? "",
          continent: values.location?.continent ?? "",
        },
        blurb: values.blurb,
        about: values.about,
        contact: {
          organizer: values.contact?.organizer,
          organizerTitle: values.contact?.organizerTitle,
          primaryContact: values.contact?.primaryContact,
        },
        links: values.links,
        isComplete: true,
      });
      console.log(result);
    } catch (err) {
      console.error("Failed to update organization:", err);
    } finally {
      setPending(false);
    }
  };

  // useEffect(() => {
  //   if (orgData) {
  //     reset(defaultValues, { keepValues: false });
  //   }
  // }, [reset, orgData, defaultValues]);
  useEffect(() => {
    if (orgData) {
      reset(
        {
          name: orgData.name || "",
          location: orgData.location || defaultOrg.location,
          logo: orgData.logo || "",
          links: orgData.links || defaultOrg.links,
          blurb: orgData.blurb || "",
          about: orgData.about || "",
          contact: {
            organizer: orgData.contact?.organizer || "",
            organizerTitle: orgData.contact?.organizerTitle || "",
            primaryContact: orgData.contact?.primaryContact || "",
          },
        },
        { keepValues: false },
      );
    }
  }, [orgData, reset]);

  return (
    <div>
      <Form {...form} key={orgData?._id}>
        <form
          className="grid gap-4 px-3 py-4 sm:grid-cols-[1fr_8%_1fr] sm:px-10"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className={cn("col-span-full flex items-start justify-between")}>
            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo</FormLabel>
                  <FormControl>
                    <LogoUploader
                      id="organization.logo"
                      onChangeAction={(file) => field.onChange(file)}
                      onRemoveAction={() => field.onChange(undefined)}
                      //    reset={reset}
                      //    disabled={}
                      initialImage={
                        typeof field.value === "string" ? field.value : ""
                      }
                      size={72}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="mb-2 flex w-full flex-col gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Name</FormLabel>

                  <FormControl>
                    <Input
                      disabled={!isAdmin}
                      {...field}
                      type="text"
                      placeholder="ex. The Street Art List"
                      className={cn("w-full border-foreground/20 bg-card")}
                    />
                  </FormControl>
                  <FormMessage />
                  {!isAdmin && (
                    <p className={cn("text-xs text-muted-foreground")}>
                      Pleae contact support to change your organization name.
                    </p>
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <MapboxInputFull
                      id="organization.location"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      reset={false}
                      placeholder="Organization Location (city, state, country, etc)..."
                      className="mb-3 w-full lg:mb-0"
                      inputClassName="rounded-lg border-foreground/20 "
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="blurb"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Blurb</FormLabel>
                  <FormControl>
                    <DebouncedFormTextarea
                      field={field}
                      maxLength={250}
                      className="max-h-30 min-h-12"
                      containerClassName="border-foreground/20"
                      placeholder="Short blurb about your organization... Limit 250 characters"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="about"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>About</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      tabIndex={0}
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      placeholder="Add any info about your organization... "
                      charLimit={2000}
                      purpose="organizerAbout"
                      formInputPreview
                      formInputPreviewClassName="min-h-12 max-h-50 "
                      inputPreviewContainerClassName="rounded-lg border-foreground/20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Separator thickness={2} orientation="vertical" className="mx-auto" />
          <div className="flex flex-col justify-between gap-4">
            <div className="flex w-full flex-col gap-4">
              <FormField
                control={form.control}
                name="contact.organizer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Contact</FormLabel>
                    <FormControl>
                      <DebouncedControllerInput
                        field={field}
                        placeholder="Title of primary contact"
                        className={cn("w-full rounded border-foreground/20")}
                        tabIndex={0}
                        onBlur={() => {
                          field.onBlur?.();

                          // console.log("Blur me", field + type)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {typeof organizerName === "string" &&
                organizerName.trim().length > 0 && (
                  <FormField
                    control={form.control}
                    name="contact.organizerTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <DebouncedControllerInput
                            field={field}
                            placeholder="Title of primary contact"
                            className={cn(
                              "w-full rounded border-foreground/20",
                            )}
                            tabIndex={0}
                            onBlur={() => {
                              field.onBlur?.();

                              // console.log("Blur me", field + type)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              <FormItem>
                <FormLabel>Organization Links</FormLabel>
                <FormControl>
                  <OrgLinksInput />
                </FormControl>
                <FormMessage />
              </FormItem>
            </div>
            {isDirty && (
              <Button
                variant={
                  isValid && isDirty && !errors
                    ? "salWithShadow"
                    : "salWithShadowHidden"
                }
                type="submit"
                size="lg"
                className="w-full self-end bg-white py-6 text-base focus-visible:bg-salPinkLt sm:max-w-50 sm:py-0 md:bg-salYellow"
                disabled={!isValid || !isDirty || pending}
              >
                {!isValid ? (
                  "Please fix the errors"
                ) : pending ? (
                  <>
                    Saving...
                    <LoaderCircle className="ml-2 inline size-4 animate-spin" />
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
      {/*    <pre className="scrollable mini text-wrap text-sm text-foreground">
        {JSON.stringify(orgData?.links, null, 2)}
        /~ {JSON.stringify(orgData?.location, null, 2)}
        /~ {JSON.stringify(orgData?.contact, null, 2)} ~/ ~/
      </pre>
      <Separator thickness={4} className="my-4" />
      <pre className="scrollable mini text-wrap text-sm text-foreground">
        {JSON.stringify(formData, null, 2)}
      </pre>*/}
    </div>
  );
};
