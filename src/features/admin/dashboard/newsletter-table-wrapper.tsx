"use client";

import { TableTypes } from "@/types/tanstack-table";

import { useDashboard } from "@/app/(pages)/dashboard/_components/DashboardContext";
import { NewsletterToolbar } from "@/app/(pages)/dashboard/newsletter/_components/newsletter/newsletterToolbar";

import { ResponsiveDataTable } from "@/components/data-table/DataTableWrapper";
import { audienceColumns } from "@/features/admin/dashboard/audience-columns";
import {
  campaignColumns,
  campaignSubColumns,
} from "@/features/admin/dashboard/campaign-columns";

import { api } from "~/convex/_generated/api";
import { useQuery } from "convex-helpers/react/cache";

export type TableWrapperProps = {
  page: TableTypes;
};

export function NewsletterTableWrapper({ page }: TableWrapperProps) {
  const { isSidebarCollapsed } = useDashboard();

  // const [selectedRow, setSelectedRow] = useState<string | null>(null);

  const adminActions = {
    isAdmin: true,
  };

  const audiencePage = page === "audience";
  const campaignPage = page === "campaigns";

  const audienceData = useQuery(
    api.newsletter.subscriber.getNewsletterSubscribers,
    audiencePage ? {} : "skip",
  );

  const campaignData = useQuery(
    api.newsletter.campaign.getCampaigns,
    campaignPage ? {} : "skip",
  );

  return (
    <>
      {audiencePage && (
        <>
          <ResponsiveDataTable
            title="Newsletter Subscriptions"
            description="View newsletter subscribers & their preferences"
            extraToolbar={<NewsletterToolbar />}
            data={audienceData?.subscribers ?? []}
            defaultFilters={[{ id: `active`, value: ["true"] }]}
            defaultSort={[{ id: `createdAt`, desc: true }]}
            columns={audienceColumns}
            tableType="audience"
            pageType="dashboard"
            pageSize={{ desktop: 50, mobile: 10 }}
            adminActions={adminActions}
          />
        </>
      )}
      {campaignPage && (
        <>
          <ResponsiveDataTable
            title="Newsletter Campaigns"
            description="View newsletter campaigns"
            data={campaignData ?? []}
            columns={campaignColumns}
            defaultVisibility={{
              id: false,
              isTest: false,
              userPlan: false,
              type: false,
              createdBy: false,

              frequency: isSidebarCollapsed,
            }}
            tableType="campaigns"
            pageType="dashboard"
            pageSize={{ desktop: 50, mobile: 10 }}
            adminActions={adminActions}
            subColumns={campaignSubColumns}
          />
        </>
      )}
    </>
  );
}
