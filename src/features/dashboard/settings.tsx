"use client";

import { useParams, usePathname, useRouter } from "next/navigation";

import { AccountSettings } from "@/components/ui/account/account-settings";
import { AppearanceSettings } from "@/components/ui/account/appearance-settings";
import { NotificationsSettings } from "@/components/ui/account/notifications-settings";
import { SecuritySettings } from "@/components/ui/account/security-settings";
import { CanceledBanner } from "@/components/ui/canceled-banner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { getUserFontSizePref } from "@/helpers/stylingFns";
import { cn } from "@/helpers/utilsFns";

import { UserPrefsType } from "~/convex/schema";
import { usePreloadedQuery } from "convex/react";

const formatKey = (key: keyof UserPrefsType): string => {
  // example: convert "notificationEmail" → "Notification email"
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
};

export const getToastMessage = (
  keys: Array<keyof UserPrefsType>,
  title?: string,
): string => {
  if (keys.length === 1) {
    const key = keys[0];
    return `${title ? title : formatKey(key)} updated`;
  }
  return "Preferences updated";
};

export default function SettingsPage() {
  // const { isMobile } = useDevice();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ slug?: string[] }>();
  const activeTab = params?.slug?.[0] ?? "account";

  const { preloadedUserData, preloadedSubStatus } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const subData = usePreloadedQuery(preloadedSubStatus);
  const { subStatus, cancelAt, hasActiveSubscription } = subData ?? {};
  const { userPref } = userData ?? {};

  const fontSizePref = getUserFontSizePref(userPref?.fontSize);
  const fontSize = fontSizePref?.body;
  const activeSub = hasActiveSubscription;

  const handleTabChange = (value: string) => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 2) {
      segments[segments.length - 1] = value;
    } else {
      segments.push(value);
    }
    router.replace("/" + segments.join("/"));
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <CanceledBanner
        activeSub={activeSub}
        subStatus={subStatus}
        fontSize={fontSize}
        willCancel={cancelAt}
      />
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-2 text-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-6"
      >
        <TabsList className="scrollable invis h-12 w-full max-w-full justify-around bg-white/80 md:w-auto md:justify-start">
          <TabsTrigger
            value="account"
            className={cn("h-9 px-4", fontSize)}
            border
          >
            Account
          </TabsTrigger>

          <TabsTrigger
            value="notifications"
            className={cn("hidden h-9 px-4 lg:block", fontSize)}
            border
          >
            Notifications
          </TabsTrigger>

          {/* /~ //NOTE: in order to disable, just add "disabled" to the tabs    trigger ~/ */}

          <TabsTrigger
            value="appearance"
            className={cn("h-9 px-4", fontSize)}
            border
          >
            Appearance
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className={cn("h-9 px-4", fontSize)}
            border
          >
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          <AccountSettings />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationsSettings />
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <AppearanceSettings />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <SecuritySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
