import type { FunctionReturnType } from "convex/server";

import { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { SelectSimple } from "@/components/ui/select";
import { cn } from "@/helpers/utilsFns";

import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
import { makeUseQueryWithStatus } from "convex-helpers/react";
import { useQueries } from "convex-helpers/react/cache/hooks";

export const chartTimeOptions = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 3 months" },
  { value: "120", label: "Last 120 days" },
  { value: "180", label: "Last 180 days" },
  { value: "365", label: "Last 365 days" },
  { value: "lastYear", label: "Last year" },
] as const;

type TimeRange = (typeof chartTimeOptions)[number]["value"];

export const chartTypeOptions = [
  { value: "application", label: "Applications" },
  { value: "user", label: "Users" },
] as const;

type ChartType = (typeof chartTypeOptions)[number]["value"];

const userChartConfig = {
  guest: {
    label: "Public",
    color: "var(--chart-2)",
  },
  user: {
    label: "Users",
    color: "var(--chart-1)",
  },
  artist: {
    label: "Artists",
    color: "var(--chart-3)",
  },
  withSub: {
    label: "Subscribers",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

const appChartConfig = {
  viewed: {
    label: "Viewed",
    color: "var(--chart-2)",
  },
  applied: {
    label: "Applied",
    color: "var(--chart-1)",
  },
  bookmarked: {
    label: "Bookmarked",
    color: "var(--chart-3)",
  },
  hidden: {
    label: "Hidden",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

type ChartContainerProps = {
  eventId?: Id<"events">;
  className?: string;
};

type UserAnalyticsType = FunctionReturnType<
  typeof api.analytics.eventAnalytics.getEventUserAnalytics
>;
type UserTotalsType = NonNullable<UserAnalyticsType>["totals"];

type ConfigMap = Record<string, { label: string; color: string }>;

function TotalsList(props: {
  config: ConfigMap;
  totals: Record<string, number>;
}) {
  const entries = Object.entries(props.config);

  return (
    <>
      {entries.map(([k, meta]) => (
        <div key={k} className="w-full rounded-md border p-2 text-center">
          <p className="text-sm font-medium">{meta.label}</p>
          <p className="text-lg font-semibold">
            {(props.totals[k] ?? 0).toLocaleString()}
          </p>
        </div>
      ))}
    </>
  );
}

export const ChartWrapper = ({ eventId, className }: ChartContainerProps) => {
  const [chartType, setChartType] = useState<ChartType>("application");
  const [timeRange, setTimeRange] = useState<TimeRange>("30");

  const useQueryWithStatus = makeUseQueryWithStatus(useQueries);

  const { data: appChartData, isPending: appChartLoading } = useQueryWithStatus(
    api.analytics.eventAnalytics.getEventAnalytics,
    chartType === "application" ? { eventId, timeRange } : "skip",
  );

  const { data: userResults, isPending: userChartLoading } = useQueryWithStatus(
    api.analytics.eventAnalytics.getEventUserAnalytics,
    chartType === "user" ? { eventId, timeRange } : "skip",
  );

  const { perDay: userChartData, totals: userTotalsData } = userResults ?? {};

  const loading =
    chartType === "application" ? appChartLoading : userChartLoading;

  const appFilteredData = appChartData ?? [];
  const userFilteredData = userChartData ?? [];
  const userTotals = userTotalsData ?? ({} as UserTotalsType);

  const config = chartType === "application" ? appChartConfig : userChartConfig;

  const filteredData =
    chartType === "application" ? appFilteredData : userFilteredData;

  function computeTotals<const C extends ConfigMap>(
    data: Array<{ date: string } & Record<keyof C, number>>,
    config: C,
  ): Record<keyof C, number> {
    const keys = Object.keys(config) as Array<keyof C>;
    const out = {} as Record<keyof C, number>;

    for (const k of keys) {
      let sum = 0;
      for (const row of data) sum += row[k];
      out[k] = sum;
    }

    return out;
  }

  return (
    <Card className={cn("pt-0", className)}>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>
            {chartType === "application" ? "Applications" : "Users"}
          </CardTitle>
          <CardDescription>
            Showing total{" "}
            {chartType === "application" ? "applications" : "users"} for the
            last 3 months
          </CardDescription>
        </div>
        <SelectSimple
          value={chartType}
          onChangeAction={(value) => setChartType(value as ChartType)}
          placeholder="Chart Type"
          options={[...chartTypeOptions]}
          className="w-40"
        />
        <SelectSimple
          value={timeRange}
          onChangeAction={(value) => setTimeRange(value as TimeRange)}
          placeholder="Last 3 months"
          options={[...chartTimeOptions]}
          className="w-40"
        />
      </CardHeader>
      <CardContent className="p-0 px-2 sm:px-6">
        {loading ? (
          <span className="flex h-full min-h-60 w-full items-center justify-center">
            Loading Data...{" "}
          </span>
        ) : !filteredData.length ? (
          <span className="flex h-full min-h-60 w-full items-center justify-center">
            No data found
          </span>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <ChartContainer config={config} className="aspect-auto h-60 w-full">
              <AreaChart data={filteredData}>
                <defs>
                  {Object.entries(config).map(([key, { color }]) => (
                    <linearGradient
                      key={key}
                      id={`fill-${key}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                    </linearGradient>
                  ))}
                </defs>

                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        });
                      }}
                      indicator="dot"
                    />
                  }
                />

                {Object.entries(config).map(([key, { color }]) => (
                  <Area
                    key={key}
                    dataKey={key}
                    type="natural"
                    fill={`url(#fill-${key})`}
                    stroke={color}
                    stackId="a"
                  />
                ))}

                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
            <div className="ml-3 flex h-full min-w-50 flex-col items-center justify-center gap-3 border-l-1.5 border-foreground/30 py-6 pl-6 text-center">
              <TotalsList
                config={config}
                totals={
                  chartType === "application"
                    ? computeTotals(appFilteredData, config)
                    : userTotals
                }
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
