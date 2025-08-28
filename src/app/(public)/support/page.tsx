"use client";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/custom-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectSimple } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { infoEmail } from "@/constants/siteInfo";
import { supportCategoryOptions } from "@/constants/support";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { ContactFormValues, contactSchema } from "@/schemas/public";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction, usePreloadedQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { LoaderCircle } from "lucide-react";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { api } from "~/convex/_generated/api";

const SupportPage = () => {
  const { preloadedUserData } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const userId = userData?.userId ?? null;
  const user = userData?.user;
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [errorFields, setErrorFields] = useState<string[]>([]);
  const [submitCounter, setSubmitCounter] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const sendEmail = useAction(api.actions.resend.sendEmail);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      category: "",
      message: "",
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = form;

  const category = watch("category");

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
    <div className="my-12 flex h-full w-full flex-col items-center justify-center gap-4">
      <h1 className="md:mb-25 mb-10 text-center font-tanker text-4xl lowercase tracking-wide md:text-[4rem]">
        Support & Contact
      </h1>
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
          <form
            ref={formRef}
            className="mt-4 flex w-full max-w-sm flex-col gap-4"
            onSubmit={handleSubmit(onSubmitAction)}
          >
            {!userId && (
              <>
                <div className={cn("flex flex-col gap-2")}>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    defaultValue={userData?.user?.name}
                    placeholder="ex. Bob Bobson"
                    className={cn(
                      "w-full border-foreground bg-card",
                      (fieldHasError("name") || errors.name) && "invalid-field",
                    )}
                  />
                </div>
                <div className={cn("flex flex-col gap-2")}>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    defaultValue={userData?.user?.email}
                    placeholder="ex. email@mail.com"
                    id="email"
                    {...register("email")}
                    className={cn(
                      "w-full border-foreground bg-card",
                      (fieldHasError("email") || errors.email) &&
                        "invalid-field",
                    )}
                  />
                </div>
              </>
            )}
            <div className={cn("flex flex-col gap-2")}>
              <Label htmlFor="category">Category</Label>
              <Controller
                control={form.control}
                name="category"
                render={({ field }) => (
                  <SelectSimple
                    options={supportCategoryOptions}
                    value={field.value}
                    onChangeAction={field.onChange}
                    placeholder="Select a category"
                    className="w-full bg-card placeholder:text-foreground"
                    itemClassName="justify-center"
                    invalid={
                      (fieldHasError("category") || !!errors.category) ?? false
                    }
                  />
                )}
              />
            </div>
            <div className={cn("flex flex-col gap-2")}>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                {...register("message")}
                disabled={!category}
                placeholder="Please be as detailed as possible to help me understand what you're running into. ie when it happened, what happened, etc."
                rows={5}
                className={cn(
                  "w-full resize-none border-foreground bg-card",
                  (fieldHasError("message") || errors.message) &&
                    "invalid-field",
                )}
              />
            </div>
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
