import { DEFAULT_ICON, DEFAULT_IMAGES } from "@/constants/pageTitles";
import { siteUrl } from "@/constants/siteInfo";

import type { Metadata } from "next";

import { notFound } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Link } from "@/components/ui/custom-link";
import { cn } from "@/helpers/utilsFns";

import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "~/convex/_generated/api";
import { fetchMutation, fetchQuery } from "convex/nextjs";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const title = "Newsletter Verification | The Street Art List";
  const description =
    "Verify your email address in order to receive the weekly and/or monthly newsletters";

  return {
    title,
    description,
    robots: "noindex, follow",
    openGraph: {
      title,
      description,
      url: `${siteUrl[0]}/resources`,
      type: "website",
      images: DEFAULT_IMAGES,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: DEFAULT_IMAGES,
    },
    icons: DEFAULT_ICON,
  };
}

export default async function NewsletterVerificationPage({
  searchParams,
}: PageProps) {
  const token = await convexAuthNextjsToken();
  const vToken = (await searchParams).vToken;
  if (!vToken || typeof vToken !== "string") {
    notFound();
  }
  const userData = await fetchQuery(api.users.getCurrentUser, {}, { token });

  let verificationStatus: string;

  try {
    const result = await fetchMutation(
      api.newsletter.subscriber.verifyNewsletterSubscription,
      { subId: vToken },
    );

    if (!result.success) {
      throw new Error(result.message);
    }

    verificationStatus = "verified";
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "already_verified") {
        verificationStatus = "already_verified";
      } else {
        verificationStatus = "no_subscription_found";
      }
    } else {
      verificationStatus = "no_subscription_found";
    }
  }

  return (
    <div className="flex h-[80dvh] w-full flex-col items-center justify-center gap-4">
      <Card
        className={cn(
          "flex h-max w-full max-w-sm flex-col gap-4 border-2 bg-background p-8",
        )}
      >
        <h1 className="text-center font-tanker text-3xl lowercase tracking-wide text-foreground">
          Newsletter Verification
        </h1>
        {verificationStatus === "verified" ? (
          <p className="w-full text-center">Success! You&apos;re verified!</p>
        ) : verificationStatus === "already_verified" ? (
          <p>
            You&apos;re already verified! If you&apos;d like to change your
            preferences, go to the{" "}
            <Link
              variant="bold"
              href={
                userData ? "/dashboard/settings/notifications" : "/auth/sign-in"
              }
              className="!text-base"
            >
              notification settings
            </Link>{" "}
            in the dashboard.
          </p>
        ) : (
          <p>Something went wrong. Please try again.</p>
        )}
        <Link href="/">
          <span className="flex items-center justify-center gap-1 text-sm font-bold text-foreground">
            <ArrowLeft className="size-4" />
            Take me to the home page
          </span>
        </Link>
      </Card>
    </div>
  );
}
