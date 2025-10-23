import { useState } from "react";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
import { makeUseQueryWithStatus } from "convex-helpers/react";
import { useQueries } from "convex-helpers/react/cache/hooks";
import { LoaderCircle } from "lucide-react";
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

export const chartTimeOptions = [
  { value: "90d", label: "Last 3 months" },
  { value: "30d", label: "Last 30 days" },
  { value: "7d", label: "Last 7 days" },
];

export const chartTypeOptions = [
  { value: "application", label: "Applications" },
  { value: "user", label: "Users" },
];

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

export const ChartWrapper = ({ eventId, className }: ChartContainerProps) => {
  const [chartType, setChartType] = useState("application");
  const [timeRange, setTimeRange] = useState("90d");

  const useQueryWithStatus = makeUseQueryWithStatus(useQueries);

  const { data: appChartData, isPending: appChartLoading } = useQueryWithStatus(
    api.analytics.eventAnalytics.getEventAnalytics,
    chartType === "application" ? { eventId } : "skip",
  );

  const { data: userChartData, isPending: userChartLoading } =
    useQueryWithStatus(
      api.analytics.eventAnalytics.getEventUserAnalytics,
      chartType === "user" ? { eventId } : "skip",
    );

  const data =
    chartType === "application" ? (appChartData ?? []) : (userChartData ?? []);

  const loading =
    chartType === "application" ? appChartLoading : userChartLoading;

  const filteredData = data.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date();
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  if (loading || !filteredData.length) {
    return (
      <div className={cn("flex w-full items-center justify-center py-6")}>
        <LoaderCircle className="animate-spin" />
        Loading...
      </div>
    );
  }

  const config =
    chartType === "application"
      ? (appChartConfig as typeof appChartConfig)
      : (userChartConfig as typeof userChartConfig);

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
          onChangeAction={setChartType}
          placeholder="Chart Type"
          options={chartTypeOptions}
          className="w-40"
        />
        <SelectSimple
          value={timeRange}
          onChangeAction={setTimeRange}
          placeholder="Last 3 months"
          options={chartTimeOptions}
          className="w-40"
        />
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={config}
          className="aspect-auto h-[250px] w-full"
        >
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
      </CardContent>
    </Card>
  );
};
