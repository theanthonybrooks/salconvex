"use client";
import { FormError } from "@/components/form-error";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/custom-link";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SelectSimple } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { infoEmail } from "@/constants/siteInfo";
import { supportCategoryOptions } from "@/constants/supportConsts";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { cn } from "@/lib/utils";
import { useDevice } from "@/providers/device-provider";
import { ContactFormValues, contactSchema } from "@/schemas/public";
import { zodResolver } from "@hookform/resolvers/zod";
import { makeUseQueryWithStatus } from "convex-helpers/react";
import { useQueries } from "convex-helpers/react/cache";
import { useAction, usePreloadedQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { capitalize } from "lodash";
import { LoaderCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { api } from "~/convex/_generated/api";

const SupportPage = () => {
  const useQueryWithStatus = makeUseQueryWithStatus(useQueries);

  const { preloadedUserData } = useConvexPreload();
  const searchParams = useSearchParams();
  const existingTicketNumber = searchParams?.get("ticketNumber");
  const userData = usePreloadedQuery(preloadedUserData);
  const userId = userData?.userId ?? null;
  const user = userData?.user;
  const { isMobile } = useDevice();
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [errorFields, setErrorFields] = useState<string[]>([]);
  const [submitCounter, setSubmitCounter] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const sendEmail = useAction(api.actions.resend.sendSupportEmail);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      category: "",
      message: "",
    },
    mode: "onChange",
  });

  const {
    handleSubmit,
    watch,
    formState: { isValid },
    getFieldState,
  } = form;

  const {
    data: ticketData,
    // isError,
    error: ticketError,
  } = useQueryWithStatus(
    api.admin.getSupportTicketStatus,
    existingTicketNumber
      ? { ticketNumber: Number(existingTicketNumber) }
      : "skip",
  );
  const category = watch("category");
  const categoryState = getFieldState("category");
  const categoryValid = !categoryState?.invalid;
  const ticketStatus = ticketData?.status;
  const ticketCreatedAt = ticketData?.createdAt;
  const ticketUpdatedAt = ticketData?.updatedAt;

  const handleReset = () => {
    setSubmitCounter(0);
    setError("");
    setPending(false);
  };
  const onSubmitAction = async (values: ContactFormValues) => {
    setSubmitCounter((prev) => prev + 1);

    setPending(true);
    try {
      await sendEmail({
        userId,
        name: user?.name ?? values.name,
        subject: "Support Form Submission",
        email: user?.email ?? values.email,
        category: values.category,
        message: values.message,
      });
      handleReset();
      setSent(true);
      form.reset();
      setTimeout(() => {
        setSent(false);
      }, 2000);
    } catch (error) {
      setError("Something went wrong");
      if (error instanceof ConvexError) {
        console.log(error.data);
        setError(error.data?.message ?? "Something went wrong");
        setErrorFields(error.data?.field ?? []);
      }
      return;
    } finally {
      setPending(false);
    }
  };

  const fieldHasError = (field: string) => {
    return errorFields.includes(field);
  };
  return (
    <div className="mx-auto my-12 flex h-full w-full max-w-[1300px] flex-col items-center justify-center gap-4">
      <h1 className="mb-10 text-center font-tanker text-4xl lowercase tracking-wide md:mb-25 md:text-[4rem]">
        Support & Contact
      </h1>
      {existingTicketNumber && ticketData && (
        <>
          <div
            className={cn(
              "mx-auto flex w-full max-w-[70vw] flex-col items-start justify-center gap-2 rounded-lg border-1.5 bg-card/70 px-6 py-10 md:px-8",
            )}
          >
            <h3
              className={cn(
                "mb-2 border-b-2 border-dotted border-foreground/60 pb-2",
              )}
            >
              Existing Ticket Details:
            </h3>

            <div
              className={cn(
                "flex grid-cols-2 flex-col gap-2 md:grid md:justify-items-center",
              )}
            >
              <section className="flex flex-col gap-2">
                <span>
                  <b>Ticket Number:</b> {existingTicketNumber}
                </span>
                <span>
                  <b>Submitted On:</b>{" "}
                  {ticketCreatedAt
                    ? new Date(ticketCreatedAt).toLocaleString()
                    : "-"}
                </span>
                {ticketUpdatedAt && (
                  <span>
                    <b>Updated On:</b>{" "}
                    {new Date(ticketUpdatedAt).toLocaleString()}
                  </span>
                )}
                <span className={cn("inline-flex items-center gap-x-1")}>
                  <b>Ticket Status:</b>
                  <p
                    className={cn(
                      "font-medium",
                      ticketStatus === "open" && "text-red-600",
                      ticketStatus === "resolved" && "text-green-700",
                    )}
                  >
                    {capitalize(ticketStatus)}
                  </p>
                </span>
              </section>
              <section className="flex flex-col gap-2">
                <span>
                  <b>Category:</b> {capitalize(ticketData?.category)}
                </span>
                <span>
                  <b>Details:</b> {ticketData?.message}
                </span>
              </section>
            </div>
          </div>

          <Separator thickness={2} className="my-10 max-w-[60vw]" />
        </>
      )}
      {existingTicketNumber && ticketError && (
        <FormError
          className={cn("mx-auto mb-14 text-center text-red-700")}
          message="No ticket found. Create a new ticket or contact us to resolve this."
        />
      )}
      <div className="flex h-full w-full grid-cols-[1fr_auto_1fr] flex-col items-start gap-x-2 px-6 md:grid md:px-8">
        <section
          className={cn(
            "mx-auto flex max-w-[90vw] flex-col items-center gap-3 md:max-w-sm",
          )}
        >
          <p className="w-full text-2xl font-medium text-foreground">
            Having issues with the site?
          </p>
          <p className="text-foreground">
            Reach out with some details of what&apos;s going on and I&apos;ll
            get back to you as soon as I can.
          </p>
          <Form {...form}>
            <form
              ref={formRef}
              className="mt-4 flex w-full max-w-sm flex-col gap-4"
              onSubmit={handleSubmit(onSubmitAction)}
            >
              {!userId && (
                <>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>

                        <FormControl>
                          <Input
                            {...field}
                            type="name"
                            placeholder="ex. Bob Bobson"
                            className={cn(
                              "w-full border-foreground bg-card",
                              fieldHasError("name") && "invalid-field",
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>

                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="ex. email@mail.com"
                            className={cn(
                              "w-full border-foreground bg-card",
                              fieldHasError("email") && "invalid-field",
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>

                    <FormControl>
                      <SelectSimple
                        options={supportCategoryOptions}
                        value={field.value}
                        onChangeAction={field.onChange}
                        placeholder="Select a category"
                        className="w-full bg-card placeholder:text-foreground sm:h-11"
                        itemClassName="justify-center"
                        invalid={
                          (fieldHasError("category") || !categoryValid) ?? false
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>

                    <FormControl>
                      <Textarea
                        {...field}
                        disabled={!category}
                        placeholder="Please be as detailed as possible to help me understand what you're running into. ie when it happened, what happened, etc."
                        rows={5}
                        className={cn(
                          "w-full resize-none border-foreground bg-card",
                          fieldHasError("message") && "invalid-field",
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                variant={isValid ? "salWithShadow" : "salWithShadowHidden"}
                className="w-full"
                disabled={!isValid || submitCounter > 5}
              >
                {pending ? (
                  <span className={cn("flex items-center gap-x-1")}>
                    Sending... <LoaderCircle className="size-4 animate-spin" />
                  </span>
                ) : sent ? (
                  "Sent!"
                ) : (
                  "Send Message"
                )}
              </Button>
            </form>
          </Form>
          {error && <p className="mt-4 text-destructive">{error}</p>}
          {submitCounter > 5 && (
            <p className="mt-4 text-destructive">
              Too many submissions. Please try again later.
            </p>
          )}
        </section>
        <Separator
          orientation={isMobile ? "horizontal" : "vertical"}
          thickness={2}
          className="mx-auto my-12 max-h-[80%] md:my-auto"
        />
        <section
          className={cn("mx-auto flex max-w-[90vw] flex-col gap-3 md:max-w-lg")}
        >
          <p className="text-2xl font-medium text-foreground">
            Have some ideas for the site or want to work together?
          </p>
          <p>
            The team is currently quite small and might take a few days to
            reply. Thanks for your patience!
          </p>
          <p className="mt-2 text-foreground">
            Shoot me an email at{" "}
            <Link
              href={`mailto:${infoEmail}?subject=Contact%20Form%20Submission`}
              className="underline underline-offset-2 lg:text-base"
            >
              {infoEmail}
            </Link>{" "}
            and we can talk!
          </p>
        </section>
      </div>
    </div>
  );
};

export default SupportPage;
