import type { CookiePref } from "@/types/user";

import { useState } from "react";

import { Cookie, MailPlus, Shield } from "lucide-react";

import type { UserPrefsType } from "~/convex/schema";
import { SubDialog } from "@/components/ui/account/manage-sub-dialog";
import { SectionItem } from "@/components/ui/account/section-item";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/components/ui/custom-link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ChangeEmailDialog } from "@/features/auth/components/change-email-dialog";
import { ResetPasswordDialog } from "@/features/auth/components/reset-password-dialog";
import { getToastMessage } from "@/features/dashboard/settings";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { getUserFontSizePref } from "@/helpers/stylingFns";
import { cn } from "@/helpers/utilsFns";
import { showToast } from "@/lib/toast";

import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "~/convex/_generated/api";
import { useMutation, usePreloadedQuery, useQuery } from "convex/react";
import { ConvexError } from "convex/values";

export const SecuritySettings = () => {
  const { signOut } = useAuthActions();

  const [pending, setPending] = useState(false);
  void pending;

  const { preloadedUserData, preloadedSubStatus } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const subData = usePreloadedQuery(preloadedSubStatus);
  const { subscription, subStatus, cancelAt } = subData ?? {};
  const canDelete =
    !subscription || subStatus === "canceled" || typeof cancelAt === "number";

  const { user, userPref, userId } = userData ?? {};
  const isAdmin = user?.role?.includes("admin");
  const fontSizePref = getUserFontSizePref(userPref?.fontSize);
  const fontSize = fontSizePref?.body;

  const sessionCount = useQuery(
    api.users.countSessions,
    userId ? { userId } : "skip",
  );

  const updateUserPrefs = useMutation(api.users.updateUserPrefs);
  const deleteSessions = useMutation(api.users.deleteSessions);
  const DeleteAccount = useMutation(api.users.deleteAccount);

  // const handleManageSubscription = useManageSubscription({ subscription });
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
  const handleDeleteSessions = async () => {
    try {
      if (!userId) {
        throw new Error("User not found");
      }
      await deleteSessions({ userId });
      // await invalidateSessions({ userId: user?.userId })
      showToast("success", "Sessions deleted!");
      sessionStorage.clear();
      signOut();
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

  const onDeleteAccount = async () => {
    setPending(true);

    localStorage.clear();

    try {
      await DeleteAccount({ method: "deleteAccount", userId });
      sessionStorage.clear();
      await signOut();
    } catch (err) {
      showToast("error", "Failed to delete account. Please contact support.");
      console.error(err);
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <Card aria-description="Privacy Settings">
        <CardHeader>
          <CardTitle>Privacy</CardTitle>
          <CardDescription>Manage your privacy settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SectionItem
            icon={Cookie}
            title="Cookies"
            description="Change your cookie preferences"
            fontSize={fontSize}
          >
            <Select
              value={userPref?.cookiePrefs}
              onValueChange={(value) =>
                handleUpdateUserPrefs(
                  {
                    cookiePrefs: value as CookiePref,
                  },
                  { title: "Cookie Preferences" },
                )
              }
            >
              <SelectTrigger
                className={cn(
                  "w-full border-1.5 border-foreground/20 sm:h-10 sm:w-[220px]",
                  fontSize === "text-base" ? "sm:text-base" : fontSize,
                )}
              >
                <SelectValue placeholder="Select One" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" center>
                  All Cookies
                </SelectItem>
                <SelectItem value="required" center>
                  Required Only
                </SelectItem>
              </SelectContent>
            </Select>
          </SectionItem>
        </CardContent>
      </Card>
      <Card aria-description="Security Settings">
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Manage your security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SectionItem
            icon={MailPlus}
            title="Email"
            description="Change your email address"
            fontSize={fontSize}
          >
            <ChangeEmailDialog />
          </SectionItem>
          <Separator />
          <SectionItem
            icon={Shield}
            title="Password"
            description="Change your password"
            fontSize={fontSize}
          >
            <ResetPasswordDialog />
          </SectionItem>
        </CardContent>
      </Card>

      <Card aria-description="Sessions Settings">
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
          <CardDescription>Manage your active sessions</CardDescription>
        </CardHeader>
        <CardContent className={cn("space-y-4")}>
          <SectionItem title="Current Session" fontSize={fontSize}>
            <Button
              type="button"
              variant="salWithShadowHiddenYlw"
              className="w-full min-w-[150px] font-bold text-red-600 sm:w-auto"
              onClick={signOut}
            >
              Sign Out
            </Button>
          </SectionItem>

          <Separator />
          {isAdmin && (
            <>
              <SectionItem
                title="Other Sessions"
                fontSize={fontSize}
                description={`${sessionCount ?? 0} active session${sessionCount && sessionCount > 1 ? "s" : ""}`}
              >
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="salWithShadowHiddenYlw"
                      className="w-full min-w-[150px] font-bold text-red-600 sm:w-auto"
                    >
                      Sign Out All
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="w-[80dvw] bg-salYellow text-foreground">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-foreground">
                        Sign out all sessions?
                      </AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogDescription className="text-foreground">
                      Are you sure you want to sign out of all your sessions?
                      You&apos;ll need to re-login on all devices.
                    </AlertDialogDescription>

                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteSessions}>
                        Yes, sign out all
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </SectionItem>

              <Separator />
            </>
          )}
          <SectionItem
            title="Delete Account"
            fontSize={fontSize}
            descriptionNode={
              <p className="text-sm text-muted-foreground">
                Permanently delete your account — any active memberships need to
                be{" "}
                <Link href="/dashboard/billing" variant="subtleUnderline">
                  canceled
                </Link>{" "}
                before this is possible
              </p>
            }
            className="rounded-lg bg-destructive/10 p-4 md:gap-x-4"
          >
            {canDelete ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    disabled={!canDelete}
                    type="button"
                    variant="destructive"
                    className="w-full min-w-[150px] font-bold sm:w-auto"
                  >
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="w-[80dvw] bg-salYellow text-foreground">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-bold text-foreground">
                      Delete Account
                    </AlertDialogTitle>
                  </AlertDialogHeader>
                  <AlertDialogDescription className="text-foreground">
                    Are you sure you want to delete your account? All data will
                    be permanently deleted.
                  </AlertDialogDescription>

                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onDeleteAccount}
                      disabled={pending}
                    >
                      Yes, Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <SubDialog>
                <Button
                  type="button"
                  variant="destructive"
                  className="w-full min-w-[150px] font-bold sm:w-auto"
                >
                  Cancel Membership
                </Button>
              </SubDialog>
            )}
          </SectionItem>
        </CardContent>
      </Card>
    </>
  );
};
