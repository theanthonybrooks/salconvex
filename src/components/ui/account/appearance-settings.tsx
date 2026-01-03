import { useState } from "react";
import { useTheme } from "next-themes";

import { RxFontSize } from "react-icons/rx";
import { Palette } from "lucide-react";

import type { FontSizeType, UserPrefsType } from "~/convex/schema";
import { SectionItem } from "@/components/ui/account/section-item";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SelectSimple } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { getToastMessage } from "@/features/dashboard/settings";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { getUserFontSizePref } from "@/helpers/stylingFns";
import { cn } from "@/helpers/utilsFns";
import { showToast } from "@/lib/toast";
import { getUserThemeOptionsFull } from "@/providers/themed-provider";

import { api } from "~/convex/_generated/api";
import { useMutation, usePreloadedQuery } from "convex/react";
import { ConvexError } from "convex/values";

export const AppearanceSettings = () => {
  const { setTheme, theme } = useTheme();
  const { preloadedUserData } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);

  const { user, userPref } = userData ?? {};
  const userThemeOptions = getUserThemeOptionsFull(user);

  const [pending, setPending] = useState(false);

  const fontSizePref = getUserFontSizePref(userPref?.fontSize);
  const fontSize = fontSizePref?.body;

  const updateUserPrefs = useMutation(api.users.updateUserPrefs);

  const handleUpdateUserPrefs = async (
    update: Partial<UserPrefsType>,
    options?: { title?: string },
  ) => {
    const { title } = options ?? {};
    setPending(true);

    if (!user) {
      throw new Error("No user found");
    }

    try {
      await updateUserPrefs(update);
      const changed = Object.keys(update) as Array<keyof UserPrefsType>;
      const message = getToastMessage(changed, title);

      showToast("success", message);
    } catch (err: unknown) {
      let message: string = "An unknown error occurred.";
      if (err instanceof ConvexError) {
        message = err.data || "An unexpected error occurred.";
      } else if (err instanceof Error) {
        message = err.message || "An unexpected error occurred.";
      }
      showToast("error", message);
    } finally {
      setPending(false);
    }
  };

  return (
    <Card className="dark:bg-tab-a10">
      <CardHeader>
        <CardTitle>Appearance </CardTitle>
        <CardDescription>Customize your display preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Separator />
        <SectionItem
          icon={Palette}
          title="Theme Color"
          description="Choose your theme color"
          fontSize={fontSize}
        >
          <SelectSimple
            options={userThemeOptions}
            disabled={pending}
            value={(userPref?.theme ?? theme) || "default"}
            onChangeAction={(val) => {
              setTheme(val);
              handleUpdateUserPrefs(
                { theme: val },
                { title: "Theme preferences" },
              );
            }}
            placeholder="Select theme"
            fontSize={fontSize}
            center
            className="dark:bg-tab-a0 border-1.5 border-foreground/20 sm:h-10 sm:w-[220px]"
            itemClassName={cn("dark:hover:text-primary-foreground")}
          />
        </SectionItem>
        <SectionItem
          icon={RxFontSize}
          title="Text Size"
          description="Choose your display text size"
          fontSize={fontSize}
        >
          <SelectSimple
            options={[
              {
                value: "normal",
                label: "Normal (Default)",
                className: "!text-sm",
              },
              {
                value: "large",
                label: "Large",
                className: "!text-base ",
              },
            ]}
            disabled={pending}
            value={userPref?.fontSize ?? "normal"}
            onChangeAction={(value) => {
              handleUpdateUserPrefs(
                {
                  fontSize: value as FontSizeType,
                },
                { title: "Font Size preference" },
              );
            }}
            placeholder="Select theme"
            fontSize={fontSize}
            center
            className={cn(
              "dark:bg-tab-a0 w-full border-1.5 border-foreground/20 sm:h-10 sm:w-[220px]",
            )}
            itemClassName={cn("dark:hover:text-primary-foreground")}
          />
        </SectionItem>
      </CardContent>
    </Card>
  );
};
