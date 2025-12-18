import type { User } from "@/types/user";
import type { FunctionReturnType } from "convex/server";

import React, { useCallback, useState } from "react";

import { Archive, Bell } from "lucide-react";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipSimple } from "@/components/ui/tooltip";
import { getUserFontSizePref } from "@/helpers/stylingFns";
import { cn } from "@/helpers/utilsFns";

import { api } from "~/convex/_generated/api";
import { useQuery } from "convex-helpers/react/cache";
import { useMutation } from "convex/react";

type NotificationsDropdownProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setTooltipDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  tooltipDisabled: boolean;
  className?: string;

  user: User;
  userPref?: UserPrefsType;
};

type NotificationsType = FunctionReturnType<
  typeof api.general.notifications.getNotifications
>;
type NotificationType =
  NonNullable<NotificationsType>["userNotifications"][number];

export const NotificationsDropdown = ({
  open,
  setOpen,
  setTooltipDisabled,
  tooltipDisabled,
  className,

  user,
  userPref,
}: NotificationsDropdownProps) => {
  // const [pending, setPending] = useState(false);
  const [optimisticallyClearedAt, setOptimisticallyClearedAt] = useState<
    number | null
  >(null);
  const isAdmin = user.role.includes("admin");
  // const isCreator = user.role.includes("creator");
  const isArtist = user.accountType?.includes("artist");
  const isOrganizer = user.accountType?.includes("organizer");
  const [activeTab, setActiveTab] = useState("all");

  const isVisible = useCallback(
    (n: NotificationType): boolean => {
      if (!optimisticallyClearedAt) return true;
      return n._creationTime > optimisticallyClearedAt;
    },
    [optimisticallyClearedAt],
  );

  const notificationsData = useQuery(
    api.general.notifications.getNotifications,
    user ? {} : "skip",
  );
  const { userNotifications, roleNotifications, dismissedNotifications } =
    notificationsData ?? {};

  const adminNotifications = (
    isAdmin
      ? (roleNotifications?.filter((n) => n.targetRole === "admin") ?? [])
      : []
  ).filter(isVisible);
  const artistNotifications = (
    isArtist
      ? (roleNotifications?.filter((n) => n.targetUserType === "artist") ?? [])
      : []
  ).filter(isVisible);
  const organizerNotifications = (
    isOrganizer
      ? (roleNotifications?.filter((n) => n.targetUserType === "organizer") ??
        [])
      : []
  ).filter(isVisible);

  console.log(userNotifications);

  const visibleUserNotifications = userNotifications?.filter(isVisible) ?? [];
  const allNotifications = [
    ...visibleUserNotifications,
    ...adminNotifications,
    ...artistNotifications,
    ...organizerNotifications,
  ];

  const userDismissedNotifications = [...(dismissedNotifications ?? [])];

  const sortByUpdatedAtDesc = (a: NotificationType, b: NotificationType) =>
    b.updatedAt - a.updatedAt;

  const uniqueNotifications = Array.from(
    new Map(allNotifications.map((n) => [n._id, n])).values(),
  ).sort(sortByUpdatedAtDesc);

  const hasUnreadNotifications = uniqueNotifications.length > 0;
  const hasAdminNotifications = adminNotifications.length > 0;
  const hasArtistNotifications = artistNotifications.length > 0;
  const hasOrganizerNotifications = organizerNotifications.length > 0;

  const clearNotifications = useMutation(
    api.general.notifications.clearNotifications,
  );
  const fontSizePref = getUserFontSizePref(userPref?.fontSize);
  const fontSize = fontSizePref?.body;

  const totalPending = uniqueNotifications.length;

  const handleClearNotifications = async (
    notificationId?: Id<"notifications">,
  ) => {
    try {
      if (!notificationId) setOptimisticallyClearedAt(Date.now());
      await clearNotifications({ notificationId });
    } catch (error) {
      console.error("Failed to clear notifications:", error);
      setOptimisticallyClearedAt(null);
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
            <Bell className="size-6" />
            {totalPending > 0 && (
              <div className="absolute right-0 top-0 flex size-5 items-center justify-center rounded-full border-1.5 border-salPinkDark bg-salPinkMed text-2xs font-semibold text-card hover:scale-105 hover:cursor-pointer">
                {totalPending}
              </div>
            )}
          </Button>
        </DropdownMenuTrigger>
      </TooltipSimple>
      <DropdownMenuContent
        className={cn(
          "z-[60] p-4",
          isAdmin ? "w-[min(28rem,90dvw)]" : "w-[min(22rem,90dvw)]",
        )}
        thick
        align="end"
        alignOffset={-10}
      >
        <DropdownMenuLabel className="!text-base font-semibold">
          Notifications
        </DropdownMenuLabel>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="scrollable invis h-12 w-full max-w-full justify-around border-none p-0 md:w-auto md:justify-start">
            <TabsTrigger
              value="all"
              variant="underline"
              className={cn("", fontSize)}
            >
              All <NotificationCount count={uniqueNotifications.length} />
            </TabsTrigger>

            {isAdmin && (
              <TabsTrigger
                value="admin"
                variant="underline"
                className={cn("", fontSize)}
              >
                Admin <NotificationCount count={adminNotifications.length} />
              </TabsTrigger>
            )}

            {isArtist && (
              <TabsTrigger
                value="artist"
                variant="underline"
                className={cn("", fontSize)}
              >
                Artist <NotificationCount count={artistNotifications.length} />
              </TabsTrigger>
            )}
            {isOrganizer && (
              <TabsTrigger
                value="organizer"
                variant="underline"
                className={cn("", fontSize)}
              >
                Organizer{" "}
                <NotificationCount count={organizerNotifications.length} />
              </TabsTrigger>
            )}
            <TabsTrigger
              value="archive"
              variant="underline"
              className={cn("", fontSize)}
            >
              <TooltipSimple content="View Archive" className="z-top">
                <Archive className="size-4 shrink-0" />
              </TooltipSimple>
            </TabsTrigger>
          </TabsList>
          {/* <DropdownMenuSeparator /> */}

          <TabsContent value="all" className="scrollable mini max-h-[50dvh]">
            {uniqueNotifications.length > 0 ? (
              <DropdownMenuGroup>
                {uniqueNotifications.map((notification) => (
                  <NotificationDropdownItem
                    key={notification._id}
                    notification={notification}
                    handleClearNotifications={handleClearNotifications}
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
                <DropdownMenuGroup>
                  {adminNotifications.map((notification) => (
                    <NotificationDropdownItem
                      key={notification._id}
                      notification={notification}
                      handleClearNotifications={handleClearNotifications}
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
                <DropdownMenuGroup>
                  {artistNotifications.map((notification) => (
                    <NotificationDropdownItem
                      key={notification._id}
                      notification={notification}
                      handleClearNotifications={handleClearNotifications}
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
                <DropdownMenuGroup>
                  {organizerNotifications.map((notification) => (
                    <NotificationDropdownItem
                      key={notification._id}
                      notification={notification}
                      handleClearNotifications={handleClearNotifications}
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
            <DropdownMenuGroup>
              {userDismissedNotifications.length > 0 ? (
                userDismissedNotifications.map((notification) => (
                  <NotificationDropdownItem
                    key={notification._id}
                    notification={notification}
                    handleClearNotifications={handleClearNotifications}
                    archived
                  />
                ))
              ) : (
                <EmptyNotifications type="archived" />
              )}
            </DropdownMenuGroup>
          </TabsContent>
        </Tabs>

        {hasUnreadNotifications && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup className="flex w-full justify-between px-2 pb-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleClearNotifications()}
              >
                Mark all as read
              </Button>
              <Button
                variant="link"
                size="sm"
                asChild
                // className="hover:scale-[1.025]"
              >
                <Link
                  href="/dashboard/settings/notifications"
                  variant="standard"
                >
                  Manage Notifications
                </Link>
              </Button>
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const NotificationDropdownItem = ({
  notification,
  handleClearNotifications,
  archived,
}: {
  notification: NotificationType;
  handleClearNotifications: (notificationId?: Id<"notifications">) => void;
  archived?: boolean;
}) => {
  const date = new Date(notification.updatedAt ?? notification._creationTime);

  const datePart = date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const timePart = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <DropdownMenuItem key={notification._id} className="group w-full" asChild>
      <Link
        key={notification._id}
        href={notification.redirectUrl ?? "/thelist/notifications"}
        className="items-start justify-between"
        onClick={() => {
          if (archived) return;
          handleClearNotifications(notification._id);
        }}
      >
        <div className="flex flex-col gap-1">
          <p className="line-clamp-2 font-medium">{notification.displayText}</p>
          <p className="text-xs text-foreground/50">
            {`${datePart} · ${timePart}`}
          </p>
        </div>

        <TooltipSimple content="Archive" className="z-top">
          <Button
            disabled={archived}
            variant="icon"
            size="sm"
            className={cn(
              "opacity-0 transition-opacity duration-200 ease-in-out hover:scale-[1.025] active:scale-975 group-hover:opacity-100",
            )}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClearNotifications(notification._id);
            }}
          >
            <Archive size={16} />
          </Button>
        </TooltipSimple>
      </Link>
    </DropdownMenuItem>
  );
};

const EmptyNotifications = ({ type }: { type?: string }) => (
  <p className="w-full py-3 text-center text-sm text-muted-foreground">
    No {type ?? "new"} notifications
  </p>
);

const NotificationCount = ({ count }: { count: number }) => {
  if (count === 0) return null;
  return (
    <p className="ml-2 flex size-5 items-center justify-center rounded-lg border-1.5 border-salPinkDark bg-salPinkLt text-2xs font-semibold text-foreground">
      {count}
    </p>
  );
};
