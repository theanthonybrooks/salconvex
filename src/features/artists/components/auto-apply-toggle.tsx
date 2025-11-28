import { useState } from "react";

import type { UserPrefsType } from "~/convex/schema";
import { Switch } from "@/components/ui/switch";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { showToast } from "@/lib/toast";

import { api } from "~/convex/_generated/api";
import { useMutation, usePreloadedQuery } from "convex/react";
import { ConvexError } from "convex/values";

export const AutoApplyToggle = () => {
  const updateUserPrefs = useMutation(api.users.updateUserPrefs);
  const { preloadedUserData, preloadedSubStatus } = useConvexPreload();
  const subData = usePreloadedQuery(preloadedSubStatus);
  const userData = usePreloadedQuery(preloadedUserData);
  const { user, userPref } = userData ?? {};
  const { hasActiveSubscription } = subData ?? {};
  const isAdmin = user?.role?.includes("admin");
  const isArtist = user?.accountType?.includes("artist");
  const validSub = (hasActiveSubscription && isArtist) || isAdmin;

  const [pending, setPending] = useState(false);
  const handleUpdateUserPrefs = async (
    update: Pick<UserPrefsType, "autoApply">,
  ) => {
    setPending(true);

    if (!user) {
      throw new Error("No user found");
    }

    try {
      await updateUserPrefs(update);

      showToast("success", "Successfully updated application preferences!");
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
    <>
      {validSub && (
        <div className="mt-2 flex w-full items-center gap-2 sm:mt-0">
          <Switch
            checked={!!userPref?.autoApply}
            disabled={pending}
            onCheckedChange={(value) =>
              handleUpdateUserPrefs({ autoApply: value === true })
            }
          />
          <p className="text-xs">
            Auto-apply: {userPref?.autoApply ? "On" : "Off"}
          </p>
        </div>
      )}
    </>
  );
};
