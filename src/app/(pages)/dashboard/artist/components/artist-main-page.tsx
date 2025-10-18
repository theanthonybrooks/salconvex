"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArtistProfileForm } from "@/features/artists/components/artist-profile-form";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { cn } from "@/helpers/utilsFns";
import { usePreloadedQuery } from "convex/react";
export const ArtistMainPage = () => {
  const { preloadedUserData, preloadedSubStatus } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const subData = usePreloadedQuery(preloadedSubStatus);

  const user = userData?.user;
  const isAdmin = user?.role?.includes("admin");
  const isArtist = user?.accountType?.includes("artist");
  const hasActiveSubscription =
    (subData?.hasActiveSubscription || isAdmin) ?? false;
  const hasValidSub = hasActiveSubscription && isArtist;

  return (
    <div className={cn("grid gap-4 p-6 md:grid-cols-2")}>
      {hasValidSub ? (
        <Card>
          <CardHeader>
            <CardTitle>Artist Profile</CardTitle>
            <CardDescription>Update your artist info</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Separator />
            <ArtistProfileForm user={user} subData={subData} type="dashboard" />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};
