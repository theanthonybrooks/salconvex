"use client";

import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { usePreloadedQuery } from "convex/react";

import { DataTable } from "@/components/data-table/data-table";
import { useAdminPreload } from "@/features/admin/admin-preload-context";
import { newsletterColumns } from "@/features/admin/dashboard/newsletter-columns";
import { userColumns } from "@/features/admin/dashboard/user-columns";
import { applicationColumns } from "@/features/artists/applications/components/events-data-table/application-columns";
import { columns } from "@/features/events/components/events-data-table/columns";
import { cn } from "@/lib/utils";
import { TableTypes } from "@/types/tanstack-table";
import { useQuery } from "convex-helpers/react/cache";
import { api } from "~/convex/_generated/api";
interface AdminDashboardTableWrapperProps {
  page: TableTypes;
}

export function AdminDashboardTableWrapper({
  page,
}: AdminDashboardTableWrapperProps) {
  // const [existingEvent, setExistingEvent] = useState<Doc<"events"> | null>(
  //   null,
  // );
  // const [existingOpenCall, setExistingOpenCall] =
  //   useState<Doc<"openCalls"> | null>(null);
  const { preloadedEventData } = useAdminPreload();
  const { preloadedUserData } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const userRole = userData?.user?.role;
  const isAdmin = userRole?.includes("admin") ?? false;

  const allEventsData = usePreloadedQuery(preloadedEventData);
  // const subEventsData = usePreloadedQuery(preloadedSubmissionData);

  const eventsData = allEventsData ?? [];
  const adminActions = {
    isAdmin,
  };

  const usersData = useQuery(api.users.usersWithSubscriptions);
  const newsletterData = useQuery(
    api.newsletter.subscriber.getNewsletterSubscribers,
  );
  const submissionsPage = page === "events";
  const appsPage = page === "applications";
  const usersPage = page === "users";
  const newsletterPage = page === "newsletter";
  const applicationData = useQuery(
    api.artists.applications.getArtistApplications2,
  );

  return (
    <>
      {submissionsPage && (
        <>
          <div className="hidden max-h-full w-full px-10 py-10 lg:block">
            <DataTable
              columns={columns}
              data={eventsData}
              defaultVisibility={{
                category: true,
                dates_edition: true,
                type: false,
              }}
              onRowSelect={(row) => {
                console.log(row);
              }}
              adminActions={adminActions}
              tableType="events"
              pageType="dashboard"
              defaultSort={{ id: `lastEditedAt`, desc: true }}
              pageSize={50}
            />
          </div>
          <div className="flex flex-col items-center justify-center gap-4 py-7 lg:hidden">
            <DataTable
              columns={columns}
              data={eventsData}
              defaultVisibility={{
                type: false,
                category: false,
                lastEditedAt: false,
                dates_edition: false,
              }}
              onRowSelect={(row) => {
                //TODO: make the preview open in new page? Or section below? Or modal? It just needs to have the event/oc data shown with a check mark for each overarching section and a spot for some admin notes and some buttons.
                console.log(row);
              }}
              adminActions={adminActions}
              tableType="events"
              pageType="dashboard"
              className="mx-auto w-full max-w-[80dvw] overflow-x-auto sm:max-w-[90vw]"
              outerContainerClassName={cn("lg:hidden")}
              defaultSort={{ id: `lastEditedAt`, desc: true }}
            />
          </div>
        </>
      )}
      {newsletterPage && (
        <>
          <div className="hidden max-h-full w-full px-10 py-10 lg:block">
            <DataTable
              columns={newsletterColumns}
              data={newsletterData?.subscribers ?? []}
              defaultVisibility={
                {
                  // category: viewAll ? true : false,
                  // dates_edition: viewAll ? true : false,
                  // type: false,
                  // role: false,
                }
              }
              toolbarData={
                {
                  // totalPerMonth: usersData?.totalPerMonth ?? 0,
                  // totalPerYear: usersData?.totalPerYear ?? 0,
                }
              }
              onRowSelect={(row) => {
                console.log(row);
              }}
              adminActions={adminActions}
              tableType="newsletter"
              pageType="dashboard"
              defaultSort={{ id: `createdAt`, desc: true }}
              pageSize={50}
            />
          </div>
          <div className="flex flex-col items-center justify-center gap-4 py-7 lg:hidden">
            <DataTable
              columns={newsletterColumns}
              data={newsletterData?.subscribers ?? []}
              defaultVisibility={
                {
                  // type: false,
                  // category: false,
                  // role: false,
                  // lastEditedAt: false,
                  // dates_edition: false,
                }
              }
              toolbarData={
                {
                  // totalPerMonth: usersData?.totalPerMonth ?? 0,
                  // totalPerYear: usersData?.totalPerYear ?? 0,
                }
              }
              defaultSort={{ id: `createdAt`, desc: true }}
              onRowSelect={(row) => {
                console.log(row);
                // setExistingEvent(row.getValue("event"));
                // setExistingOpenCall(row.getValue("openCall"));
              }}
              adminActions={adminActions}
              tableType="newsletter"
              pageType="dashboard"
              className="mx-auto w-full max-w-[80dvw] overflow-x-auto sm:max-w-[90vw]"
              outerContainerClassName={cn("lg:hidden")}
            />
          </div>
        </>
      )}
      {usersPage && (
        <>
          <div className="hidden max-h-full w-full px-10 py-10 lg:block">
            <DataTable
              columns={userColumns}
              data={usersData?.users ?? []}
              defaultVisibility={{
                category: true,
                dates_edition: true,
                type: false,
                role: false,
              }}
              toolbarData={{
                totalMonthly: usersData?.totalMonthly ?? 0,
                totalYearly: usersData?.totalYearly ?? 0,
                totalThisMonth: usersData?.totalThisMonth ?? 0,
                totalThisYear: usersData?.totalThisYear ?? 0,
                userCount: usersData?.users?.length ?? 0,
              }}
              onRowSelect={(row) => {
                console.log(row);
              }}
              adminActions={adminActions}
              tableType="users"
              pageType="dashboard"
              defaultSort={{ id: `createdAt`, desc: true }}
              pageSize={50}
            />
          </div>
          <div className="flex flex-col items-center justify-center gap-4 py-7 lg:hidden">
            <DataTable
              columns={userColumns}
              data={usersData?.users ?? []}
              defaultVisibility={{
                type: false,
                category: false,
                role: false,
                lastEditedAt: false,
                dates_edition: false,
              }}
              toolbarData={{
                totalMonthly: usersData?.totalMonthly ?? 0,
                totalYearly: usersData?.totalYearly ?? 0,
                totalThisMonth: usersData?.totalThisMonth ?? 0,
                totalThisYear: usersData?.totalThisYear ?? 0,
                userCount: usersData?.users?.length ?? 0,
              }}
              defaultSort={{ id: `createdAt`, desc: true }}
              onRowSelect={(row) => {
                console.log(row);
                // setExistingEvent(row.getValue("event"));
                // setExistingOpenCall(row.getValue("openCall"));
              }}
              adminActions={adminActions}
              tableType="users"
              pageType="dashboard"
              className="mx-auto w-full max-w-[80dvw] overflow-x-auto sm:max-w-[90vw]"
              outerContainerClassName={cn("lg:hidden")}
            />
          </div>
        </>
      )}
      {appsPage && (
        <>
          <div className="hidden max-h-full w-full px-10 py-10 lg:block">
            <DataTable
              columns={applicationColumns}
              data={applicationData ?? []}
              defaultVisibility={{
                dates_edition: false,
                manualApplied: false,
                productionEnd: false,
                eventEnd: false,
              }}
              // onRowSelect={(row) => {
              //   console.log(row);
              // }}
              adminActions={adminActions}
              tableType="applications"
              pageType="dashboard"
            />
          </div>
          <div className="flex flex-col items-center justify-center gap-4 py-7 lg:hidden">
            <DataTable
              columns={applicationColumns}
              data={applicationData ?? []}
              defaultVisibility={{
                dates_edition: false,
                manualApplied: false,
                productionEnd: false,
                eventEnd: false,
              }}
              // onRowSelect={(row) => {
              //   console.log(row);
              // }}
              adminActions={adminActions}
              tableType="applications"
              pageType="dashboard"
              className="mx-auto w-full max-w-[80dvw] overflow-x-auto sm:max-w-[90vw]"
              outerContainerClassName={cn("lg:hidden")}
            />
          </div>
        </>
      )}
    </>
  );
}
