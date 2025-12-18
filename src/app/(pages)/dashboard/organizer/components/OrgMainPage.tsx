"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { OrgInfo } from "@/app/(pages)/dashboard/organizer/components/OrgInfo";
import { StaffPage } from "@/app/(pages)/dashboard/organizer/components/StaffPage";
import { motion } from "framer-motion";

import type { Doc, Id } from "~/convex/_generated/dataModel";
import { ResponsiveDataTable } from "@/components/data-table/DataTableWrapper";
import { Card } from "@/components/ui/card";
import { LoadingBalls } from "@/components/ui/loading-balls";
import { SearchMappedSelect } from "@/components/ui/mapped-select";
import NavTabs from "@/components/ui/nav-tabs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getEventColumns } from "@/features/events/components/events-data-table/event-columns";
import { OrgDelete } from "@/features/organizers/components/org-delete";
import { OrganizerLogoName } from "@/features/organizers/components/organizer-logo-name-card";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { getUserFontSizePref } from "@/helpers/stylingFns";
import { cn } from "@/helpers/utilsFns";
import { useDevice } from "@/providers/device-provider";

import { api } from "~/convex/_generated/api";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { usePreloadedQuery } from "convex/react";

export const OrgMainPage = () => {
  const { isMobile } = useDevice();
  const { preloadedUserData } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const [activeTab, setActiveTab] = useState("orgInfo");
  const { user, userPref } = userData ?? {};
  const [selectedOrg, setSelectedOrg] = useState<Id<"organizations"> | null>(
    null,
  );
  const isAdmin = user?.role?.includes("admin");
  // const isAdmin = false;

  const fontSizePref = getUserFontSizePref(userPref?.fontSize);
  const fontSize = fontSizePref?.body;
  //   const isAdmin = user?.role?.includes("admin");
  const userOrgResults = useQuery(
    api.organizer.organizations.getUserOrganizations,
    { query: "" },
  );

  const orgEventsData = useQuery(
    api.events.event.getEventByOrgId,
    selectedOrg ? { orgId: selectedOrg } : "skip",
  );

  const { data: userOrgData, success } = userOrgResults ?? {};

  const userOrgs = useMemo(() => userOrgData ?? [], [userOrgData]);
  const currentOrgEvents = useMemo(() => orgEventsData ?? [], [orgEventsData]);
  const hasEvents = currentOrgEvents.length > 0;
  const noOrgs = userOrgs.length === 0;
  const canDelete = isAdmin && selectedOrg && !hasEvents;

  const tabList = [
    { id: "orgInfo", label: "Organization Info" },
    { id: "events", label: "My Events" },
    { id: "staff", label: "Staff" },
    // { id: "analytics", label: "Analytics" },
    ...(isAdmin ? [{ id: "invoices", label: "Invoices" }] : []),
  ] as const;

  const tabListMobile = tabList.map((tab) => tab.id);

  const orgData = {
    "": [...userOrgs],
  };

  useEffect(() => {
    if (userOrgs.length > 0 && !selectedOrg) {
      setSelectedOrg(userOrgs[0]._id);
    }
  }, [userOrgs, selectedOrg]);

  // console.log(selectedOrg);

  const currentOrg = userOrgs.find((org) => org._id === selectedOrg);
  const isOrgOwner = currentOrg?.ownerId === user?._id;
  const allowedEditor =
    user?._id && currentOrg?.allowedEditors?.includes(user._id);

  const adminActions = {
    isAdmin: Boolean(isAdmin),
    isEditor: isOrgOwner || allowedEditor || isAdmin,
  };

  const handleResetSelection = () => {
    setSelectedOrg(null);
  };

  return (
    <div className={cn("flex flex-col gap-3 p-4 sm:p-10")}>
      <div
        className={cn(
          "flex flex-col items-center gap-3 sm:flex-row sm:justify-between",
        )}
      >
        <div className={cn("flex w-full items-center gap-3 sm:w-max")}>
          <SearchMappedSelect<Doc<"organizations">>
            value={selectedOrg ?? ""}
            disabled={noOrgs}
            data={orgData}
            getItemLabel={(org) => (
              <OrganizerLogoName organizer={org} fontSize={fontSize} />
            )}
            getItemValue={(org) => org._id}
            onChange={(val) => setSelectedOrg(val as Id<"organizations">)}
            searchFields={["name", "slug"]}
            className={cn("h-12 min-w-80 justify-start bg-card py-2")}
            popover={{
              align: "center",
              contentClassName: "max-w-[90vw] ",
              listClassName: "max-h-68",
            }}
            getItemDisplay={(org) => (
              <div className="flex items-center gap-2">
                <Image
                  src={org.logo}
                  alt={org.name}
                  width={30}
                  height={30}
                  className="rounded-full"
                />
                <span className="truncate">{org.name}</span>
              </div>
            )}
            placeholder="Select an organization"
          />
          {/*     <Button
            variant="outline"
            className="flex items-center gap-2 border-foreground/20 bg-salYellow/30 sm:h-12"
          >
            <Plus className="size-4 shrink-0" />
            /~ <span>Add Organization</span> ~/
          </Button>*/}
        </div>
        {selectedOrg && (
          <div className={cn("flex flex-col items-end gap-2")}>
            <p className="text-xs text-muted-foreground">
              Last Updated:{" "}
              {new Date(currentOrg?.updatedAt ?? "").toLocaleString()}
            </p>
            <p className="text-sm">
              <b>Current Role:</b>{" "}
              {isOrgOwner
                ? "Org Owner"
                : allowedEditor
                  ? "Editor"
                  : isAdmin
                    ? "Admin"
                    : "Guest"}
            </p>
            {canDelete && (
              <OrgDelete
                orgId={selectedOrg}
                hasEvents={hasEvents}
                resetSelection={handleResetSelection}
              />
            )}
          </div>
        )}
        {/*//todo: replace this with the actual title/role within the org*/}
      </div>

      {selectedOrg && (
        <>
          {!isMobile ? (
            <NavTabs
              tabs={[...tabList]}
              activeTab={activeTab}
              setActiveTab={(value) => setActiveTab(value)}
              fontSize={fontSize}
              variant="card"
            >
              <div id="orgInfo">
                <OrgInfo
                  orgData={currentOrg}
                  user={user}
                  key={selectedOrg ?? "no-org"}
                />
              </div>
              <div id="events">
                <ResponsiveDataTable
                  title="Events"
                  description="View all of your events"
                  data={currentOrgEvents ?? []}
                  columns={
                    getEventColumns(false) as ColumnDef<
                      Record<string, unknown>
                    >[]
                  }
                  defaultVisibility={{
                    desktop: {
                      type: false,
                      _id: false,
                    },
                    mobile: {
                      type: false,
                      category: false,
                      _id: false,
                      lastEditedAt: false,
                    },
                  }}
                  defaultSort={[{ id: `lastEditedAt`, desc: true }]}
                  tableType="events"
                  pageType="dashboard"
                  pageSize={{ desktop: 50, mobile: 10 }}
                  adminActions={adminActions}
                />
              </div>
              <div id="staff">
                <StaffPage
                  orgId={selectedOrg}
                  adminActions={adminActions}
                  isOwner={isOrgOwner}
                />
              </div>
              {isAdmin && <div id="invoices">Invoices page</div>}
            </NavTabs>
          ) : (
            <Card
              className={cn(
                "mb-10 w-full gap-x-3 rounded-3xl border-foreground/20 bg-white/50 p-3 first:mt-6 lg:hidden",
              )}
            >
              <Tabs
                onValueChange={(value) => setActiveTab(value)}
                value={activeTab}
                defaultValue={activeTab}
                className="flex w-full flex-col justify-center"
              >
                <TabsList className="scrollable justx invis relative flex h-12 w-full justify-around rounded-xl bg-white/60">
                  {tabListMobile.map((tab) => (
                    <TabsTrigger
                      key={tab}
                      value={tab}
                      className={cn(
                        "relative z-10 flex h-10 w-full items-center justify-center px-4 text-sm font-medium",
                        activeTab === tab
                          ? "text-black"
                          : "text-muted-foreground",
                      )}
                    >
                      {activeTab === tab && (
                        <motion.div
                          layoutId="tab-bg"
                          className="absolute inset-0 z-0 rounded-md border-1.5 border-foreground bg-background shadow-sm"
                          initial={false}
                          exit={{ opacity: 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                          }}
                        />
                      )}
                      <span className="relative z-10">
                        {tab === "orgInfo" && "Organizer"}
                        {tab === "events" && "Submissions"}
                      </span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="orgInfo">
                  <OrgInfo orgData={currentOrg} user={user} />
                </TabsContent>
                <TabsContent value="events">
                  {" "}
                  <ResponsiveDataTable
                    title="Events"
                    description="View all of your events"
                    data={currentOrgEvents ?? []}
                    columns={
                      getEventColumns(false) as ColumnDef<
                        Record<string, unknown>
                      >[]
                    }
                    defaultVisibility={{
                      desktop: {
                        type: false,
                        _id: false,
                      },
                      mobile: {
                        type: false,
                        category: false,
                        _id: false,
                        lastEditedAt: false,
                      },
                    }}
                    defaultSort={[{ id: `lastEditedAt`, desc: true }]}
                    tableType="events"
                    pageType="dashboard"
                    pageSize={{ desktop: 50, mobile: 10 }}
                  />
                </TabsContent>
              </Tabs>
            </Card>
          )}
        </>
      )}
      {!success ? (
        <LoadingBalls />
      ) : noOrgs ? (
        <div className="flex flex-col items-center justify-center gap-4 p-10">
          <p className="text-center text-xl font-bold">
            You don&apos;t have any organizations yet.
          </p>
          <p className="text-center text-sm">
            Create one by adding a new event or open call.
          </p>
          {/* <Button
            variant="outline"
            className="flex items-center gap-2 border-foreground/20 bg-salYellow/30 sm:h-12"
          >
            <Plus className="size-4 shrink-0" />
            /~ <span>Add Organization</span> ~/
          </Button>*/}
        </div>
      ) : null}
    </div>
  );
};
