import { notificationTypeIconMap } from "@/constants/notificationConsts";
import { returnNinetyNinePlus } from "@/constants/numberFns";

import type { ExtendedNotificationType } from "@/helpers/notificationFns";
import type { NotificationItemType } from "@/types/notificationTypes";
import type { User } from "@/types/user";

import React, { useState } from "react";
import { useIsMobile } from "@/hooks/use-media-query";

import {
  Archive,
  ArchiveRestore,
  Bell,
  Inbox,
  SaveIcon,
  SaveOff,
} from "lucide-react";

import type { Id } from "~/convex/_generated/dataModel";
import type { UserPrefsType } from "~/convex/schema";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/custom-link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SelectSimple } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipSimple } from "@/components/ui/tooltip";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { filterNotificationsByType } from "@/helpers/notificationFns";
import { getUserFontSizePref } from "@/helpers/stylingFns";
import { cn } from "@/helpers/utilsFns";

import { api } from "~/convex/_generated/api";
import { useQuery } from "convex-helpers/react/cache";
import { useMutation, usePreloadedQuery } from "convex/react";

type NotificationsDropdownProps = {
  // open: boolean;
  // setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setTooltipDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  tooltipDisabled: boolean;
  className?: string;

  user: User;
  userPref?: UserPrefsType;
};

export const NotificationsDropdown = ({
  setTooltipDisabled,
  tooltipDisabled,
  className,

  user,
  userPref,
}: NotificationsDropdownProps) => {
  const { preloadedSubStatus } = useConvexPreload();
  const subData = usePreloadedQuery(preloadedSubStatus);
  const { hasActiveSubscription, subPlan } = subData ?? {};
  const userPlan = subPlan ?? 0;
  // const userPlan = 1;
  const [open, setOpen] = useState(false);
  // const [pending, setPending] = useState(false);

  const isUser = user.role?.includes("user");
  const isAdmin = user.role.includes("admin");
  // const isCreator = user.role.includes("creator");
  const isArtist = user.accountType?.includes("artist");
  const isOrganizer = user.accountType?.includes("organizer");
  const isBoth = isArtist && isOrganizer;
  const [activeTab, setActiveTab] = useState("all");

  const notificationsData = useQuery(
    api.general.notifications.getNotifications,
    user ? {} : "skip",
  );
  const { userNotifications, dismissedNotifications } = notificationsData ?? {};
  const notificationFilterOptions = [
    { value: "all", label: "All" },
    { value: "newEvent", label: "Events Only" },
    { value: "newOpenCall", label: "Open Calls Only" },
  ] as const;

  const adminNotificationFilterOptions = [
    ...notificationFilterOptions,
    { value: "subscription", label: "Subscriptions Only" },
    { value: "socials", label: "Socials Only" },
  ] as const;

  const availableNotificationFilterOptions = isAdmin
    ? adminNotificationFilterOptions
    : hasActiveSubscription && userPlan >= 2
      ? notificationFilterOptions
      : notificationFilterOptions.filter((opt) => opt.value !== "newOpenCall");

  const [notificationFilter, setNotificationFilter] =
    useState<ExtendedNotificationType>("all");

  const adminNotifications = filterNotificationsByType(
    isAdmin
      ? (userNotifications?.filter((n) => n.targetRole === "admin") ?? [])
      : [],
    notificationFilter,
  );
  const artistNotifications = filterNotificationsByType(
    isArtist
      ? (userNotifications?.filter((n) => n.targetUserType === "artist") ?? [])
      : [],
    notificationFilter,
  );
  const organizerNotifications = filterNotificationsByType(
    isOrganizer
      ? (userNotifications?.filter((n) => n.targetUserType === "organizer") ??
          [])
      : [],
    notificationFilter,
  );

  const visibleUserNotifications = userNotifications ?? [];

  const userDismissedNotifications = filterNotificationsByType(
    [...(dismissedNotifications ?? [])],
    notificationFilter,
  );

  const sortByUpdatedAtDesc = (
    a: NotificationItemType,
    b: NotificationItemType,
  ) => b.updatedAt - a.updatedAt;

  const uniqueNotifications = filterNotificationsByType(
    Array.from(
      new Map(visibleUserNotifications.map((n) => [n._id, n])).values(),
    ).sort(sortByUpdatedAtDesc),
    notificationFilter,
  );

  const filterSavedNotifications = (notifications: NotificationItemType[]) =>
    notifications.filter((n) => !n.saved);

  const checkIfSaved = (notifications: NotificationItemType[]) =>
    notifications.every((n) => n.saved);

  const hasAdminNotifications = adminNotifications.length > 0;
  const hasArtistNotifications = artistNotifications.length > 0;
  const hasOrganizerNotifications = organizerNotifications.length > 0;

  const clearNotifications = useMutation(
    api.general.notifications.clearNotifications,
  );
  const saveNotification = useMutation(
    api.general.notifications.saveNotification,
  );
  const fontSizePref = getUserFontSizePref(userPref?.fontSize);
  const fontSize = fontSizePref?.body;

  const totalPending = uniqueNotifications.length;
  const hasUnreadNotifications =
    filterSavedNotifications(uniqueNotifications).length > 0;
  const totalNotifications = visibleUserNotifications.length;

  const handleClearNotifications = async (
    notificationId?: Id<"notifications">,
  ) => {
    try {
      // if (!notificationId) setOptimisticallyClearedAt(Date.now());
      await clearNotifications({ notificationId });
    } catch (error) {
      console.error("Failed to clear notifications:", error);
      // setOptimisticallyClearedAt(null);
    }
  };

  const handleSaveNotification = async (
    notificationId: Id<"notifications">,
  ) => {
    try {
      await saveNotification({ notificationId });
    } catch (error) {
      console.error("Failed to save notification:", error);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <DropdownMenu
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) {
          setTooltipDisabled(true);
          setTimeout(() => setTooltipDisabled(false), 250);
        }
      }}
    >
      <TooltipSimple
        content="View Nofitications"
        side="bottom"
        align="start"
        disabled={open || tooltipDisabled}
      >
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn("relative size-12.5 rounded-full", className)}
          >
            <Bell className="size-7 sm:size-6" />
            {totalPending > 0 && (
              <div
                className={cn(
                  "absolute right-1 top-0 flex h-5 min-w-5 items-center justify-center rounded-full border-1.5 border-salPinkDark bg-salPinkMed text-2xs font-semibold text-card hover:scale-105 hover:cursor-pointer sm:right-0",
                  totalPending > 99 && "px-0.5 sm:-right-1",
                  checkIfSaved(uniqueNotifications) &&
                    "border-foreground/70 bg-salYellowLt text-foreground",
                )}
              >
                {returnNinetyNinePlus(totalPending)}
              </div>
            )}
          </Button>
        </DropdownMenuTrigger>
      </TooltipSimple>
      <DropdownMenuContent
        className={cn(
          "z-[60] w-dvw p-4",
          isAdmin ? "sm:w-[min(28rem,90dvw)]" : "sm:w-[min(23rem,90dvw)]",
        )}
        thick
        align="end"
        alignOffset={-10}
      >
        <div className="flex items-center justify-between gap-2 py-3 pr-1">
          <DropdownMenuLabel className="!text-base font-semibold">
            Notifications
          </DropdownMenuLabel>
          {(totalNotifications > 0 || activeTab === "archive") && (
            <SelectSimple
              options={[...availableNotificationFilterOptions]}
              value={notificationFilter}
              onChangeAction={(value) =>
                setNotificationFilter(value as ExtendedNotificationType)
              }
              className="!h-8 w-40 border bg-card"
            />
          )}
        </div>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="scrollable invis h-12 w-full max-w-full justify-around border-none p-0 md:justify-start">
            <TabsTrigger
              value="all"
              variant="underline"
              className={cn(
                "min-w-20",
                !isBoth && "w-full max-w-full",
                fontSize,
              )}
            >
              All{" "}
              <NotificationCount
                count={totalPending}
                allSaved={checkIfSaved(uniqueNotifications)}
              />
            </TabsTrigger>

            {isAdmin && (
              <TabsTrigger
                value="admin"
                variant="underline"
                className={cn("min-w-20 max-w-25", fontSize)}
              >
                Admin{" "}
                <NotificationCount
                  count={adminNotifications.length}
                  allSaved={checkIfSaved(adminNotifications)}
                />
              </TabsTrigger>
            )}

            {isArtist && (
              <TabsTrigger
                value="artist"
                variant="underline"
                className={cn(
                  "min-w-20 max-w-30",
                  !isBoth && "w-full max-w-full",
                  fontSize,
                )}
              >
                Artist{" "}
                <NotificationCount
                  count={artistNotifications.length}
                  allSaved={checkIfSaved(artistNotifications)}
                />
              </TabsTrigger>
            )}
            {isOrganizer && (
              <TabsTrigger
                value="organizer"
                variant="underline"
                className={cn(
                  "min-w-25",
                  isUser && isOrganizer && "w-full",
                  !isBoth && "w-full max-w-full",
                  fontSize,
                )}
              >
                Organizer{" "}
                <NotificationCount
                  count={organizerNotifications.length}
                  allSaved={checkIfSaved(organizerNotifications)}
                />
              </TabsTrigger>
            )}
            <TabsTrigger
              value="archive"
              variant="underline"
              className={cn("px-3", fontSize)}
            >
              <TooltipSimple content="View Archive" className="z-top">
                <Archive className="size-4 shrink-0" />
              </TooltipSimple>
            </TabsTrigger>
          </TabsList>
          {/* <DropdownMenuSeparator /> */}

          <TabsContent value="all" className="scrollable mini max-h-[50dvh]">
            {uniqueNotifications.length > 0 ? (
              <DropdownMenuGroup className="space-y-1">
                {uniqueNotifications.map((notification, i) => (
                  <NotificationDropdownItem
                    key={notification._id}
                    notification={notification}
                    handleClearNotifications={handleClearNotifications}
                    handleSaveNotification={handleSaveNotification}
                    user={user}
                    className={cn(i % 2 !== 0 && "bg-muted-foreground/5")}
                  />
                ))}
              </DropdownMenuGroup>
            ) : (
              <EmptyNotifications />
            )}
          </TabsContent>

          {isAdmin && (
            <TabsContent
              value="admin"
              className="scrollable mini max-h-[50dvh]"
            >
              {hasAdminNotifications ? (
                <DropdownMenuGroup className="space-y-1">
                  {adminNotifications.map((notification, i) => (
                    <NotificationDropdownItem
                      key={notification._id}
                      notification={notification}
                      handleClearNotifications={handleClearNotifications}
                      handleSaveNotification={handleSaveNotification}
                      user={user}
                      className={cn(i % 2 !== 0 && "bg-muted-foreground/5")}
                    />
                  ))}
                </DropdownMenuGroup>
              ) : (
                <EmptyNotifications />
              )}
            </TabsContent>
          )}

          {isArtist && (
            <TabsContent
              value="artist"
              className="scrollable mini max-h-[50dvh]"
            >
              {hasArtistNotifications ? (
                <DropdownMenuGroup className="space-y-1">
                  {artistNotifications.map((notification, i) => (
                    <NotificationDropdownItem
                      key={notification._id}
                      notification={notification}
                      handleClearNotifications={handleClearNotifications}
                      handleSaveNotification={handleSaveNotification}
                      user={user}
                      className={cn(i % 2 !== 0 && "bg-muted-foreground/5")}
                    />
                  ))}
                </DropdownMenuGroup>
              ) : (
                <EmptyNotifications type="artist" />
              )}
            </TabsContent>
          )}
          {isOrganizer && (
            <TabsContent
              value="organizer"
              className="scrollable mini max-h-[50dvh]"
            >
              {hasOrganizerNotifications ? (
                <DropdownMenuGroup className="space-y-1">
                  {organizerNotifications.map((notification, i) => (
                    <NotificationDropdownItem
                      key={notification._id}
                      notification={notification}
                      handleClearNotifications={handleClearNotifications}
                      user={user}
                      className={cn(i % 2 !== 0 && "bg-muted-foreground/5")}
                    />
                  ))}
                </DropdownMenuGroup>
              ) : (
                <EmptyNotifications type="organizer" />
              )}
            </TabsContent>
          )}
          <TabsContent
            value="archive"
            className="scrollable mini max-h-[50dvh]"
          >
            <DropdownMenuGroup className="space-y-1">
              {userDismissedNotifications.length > 0 ? (
                userDismissedNotifications.map((notification, i) => (
                  <NotificationDropdownItem
                    key={notification._id}
                    notification={notification}
                    handleClearNotifications={handleClearNotifications}
                    user={user}
                    className={cn(i % 2 !== 0 && "bg-muted-foreground/5")}
                    archived
                  />
                ))
              ) : (
                <EmptyNotifications type="archived" />
              )}
            </DropdownMenuGroup>
          </TabsContent>
        </Tabs>

        <DropdownMenuSeparator />
        <DropdownMenuGroup
          className={cn(
            "flex w-full px-2",
            hasUnreadNotifications
              ? "justify-between pb-2 pt-4"
              : "justify-end pt-2",
          )}
        >
          {hasUnreadNotifications && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleClearNotifications()}
            >
              Mark all as read
            </Button>
          )}
          <Button variant="link" size="sm" asChild>
            <Link href="/dashboard/settings/notifications" variant="standard">
              Manage Notifications
            </Link>
          </Button>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const NotificationDropdownItem = ({
  notification,
  handleClearNotifications,
  handleSaveNotification,
  archived,
  user,
  className,
}: {
  user: User;
  notification: NotificationItemType;
  handleClearNotifications: (notificationId?: Id<"notifications">) => void;
  handleSaveNotification?: (notificationId: Id<"notifications">) => void;
  archived?: boolean;
  className?: string;
}) => {
  // const router = useRouter();
  const { preloadedSubStatus } = useConvexPreload();
  const subData = usePreloadedQuery(preloadedSubStatus);
  const { hasActiveSubscription, subPlan } = subData ?? {};
  const isMobile = useIsMobile();
  const { role } = user;
  const isAdmin = role?.includes("admin") || false;
  const userPlan = subPlan ?? 0;

  const {
    _id: id,
    type,
    // userId,
    // targetRole,
    // targetUserType,
    saved,
    redirectUrl,
    eventId,
    importance,
    description,
    displayText,
    _creationTime: createdAt,
    updatedAt,
  } = notification;
  const updateEventAnalytics = useMutation(
    api.analytics.eventAnalytics.markEventAnalytics,
  );
  const updateUserLastActive = useMutation(api.users.updateUserLastActive);
  const unarchive = useMutation(
    api.general.notifications.unarchiveNotification,
  );
  const date = new Date(updatedAt ?? createdAt);

  const datePart = date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const timePart = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  const Icon = notificationTypeIconMap[type];
  const formatUrlBySubscription = () => {
    if (hasActiveSubscription) return redirectUrl;
    return redirectUrl.replace("/call?tab=event", "");
  };

  const handleRunAnalytics = (eventId: Id<"events">) => {
    if (isAdmin) return;

    updateEventAnalytics({
      eventId,
      plan: userPlan,
      action: "view",
      src: "notifications",
      userType: user?.accountType,
      hasSub: Boolean(user?.plan),
    });
  };

  return (
    <DropdownMenuItem
      key={id}
      className={cn(
        "group w-full",
        !archived && importance === "high" && "bg-salPinkLt/70",
        className,
        saved && "bg-salYellowLtHover",
      )}
      asChild
    >
      <Link
        key={id}
        href={formatUrlBySubscription()}
        className="items-start justify-between"
        onClick={() => {
          updateUserLastActive({ email: user?.email ?? "" });
          if (eventId) handleRunAnalytics(eventId);
          if (archived) return;
          handleClearNotifications(id);
        }}
        variant="standard"
      >
        <div className="flex gap-3">
          {Icon && <Icon className="mt-1 size-4 shrink-0" />}
          <div className="flex flex-col gap-1">
            <p className="line-clamp-2 font-medium">
              {displayText}

              {/* {dedupeKey}-{userId} */}
            </p>
            {description && <p>{description}</p>}
            <p className="text-xs text-foreground/50">
              {`${datePart} · ${timePart}`}
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between">
          <TooltipSimple
            content={archived ? "Unarchive" : "Archive"}
            className="z-top"
            disabled={isMobile}
          >
            <div
              className={cn(
                "flex h-9 items-center justify-center px-3 opacity-100 transition-opacity duration-200 ease-in-out hover:scale-[1.025] active:scale-975 group-hover:opacity-100 sm:opacity-0",
              )}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (archived) {
                  unarchive({ notificationId: id });
                } else {
                  handleClearNotifications(id);
                }
              }}
            >
              {archived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
            </div>
          </TooltipSimple>
          {handleSaveNotification && (
            <TooltipSimple
              content={saved ? "Saved" : "Save"}
              className="z-top"
              disabled={isMobile}
              side="bottom"
            >
              <div
                className={cn(
                  "flex h-9 items-center justify-center px-3 opacity-100 transition-opacity duration-200 ease-in-out hover:scale-[1.025] active:scale-975 group-hover:opacity-100 sm:opacity-0",
                  saved && "sm:opacity-100",
                )}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  handleSaveNotification(id);
                }}
              >
                {saved ? <SaveOff size={16} /> : <SaveIcon size={16} />}
              </div>
            </TooltipSimple>
          )}
        </div>
      </Link>
    </DropdownMenuItem>
  );
};

const EmptyNotifications = ({ type }: { type?: string }) => (
  <div className="flex w-full flex-col items-center justify-center gap-3 py-3">
    <Inbox className="size-5 shrink-0 rounded-full text-foreground/30 ring-1.5 ring-foreground/30 ring-offset-4" />
    <p className="w-full py-1 text-center text-sm text-muted-foreground">
      No {type ?? "new"} notifications
    </p>
  </div>
);

const NotificationCount = ({
  count,
  allSaved,
}: {
  count: number;
  allSaved?: boolean;
}) => {
  if (count === 0) return null;
  return (
    <p
      className={cn(
        "ml-2 flex h-5 min-w-5 items-center justify-center rounded-lg border-1.5 border-salPinkDark bg-salPinkLt text-2xs font-semibold text-foreground",
        count === 0 && "invisible",
        count > 99 && "px-0.5",
        allSaved && "border-salYellowDark bg-salYellowLt",
      )}
    >
      {returnNinetyNinePlus(count)}
    </p>
  );
};
