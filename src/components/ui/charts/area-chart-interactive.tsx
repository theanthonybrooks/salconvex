"use client";

import * as React from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoaderCircle } from "lucide-react";

export const description = "An interactive area chart";

// const chartData = [
//   { date: "2025-09-01", applied: 10, accepted: 12 },
//   { date: "2025-09-02", applied: 13, accepted: 11 },
//   { date: "2025-09-03", applied: 14, accepted: 10 },
//   { date: "2025-09-09", applied: 12, accepted: 15 },
//   { date: "2025-09-08", applied: 11, accepted: 13 },
//   { date: "2025-09-10", applied: 15, accepted: 14 },
//   { date: "2025-09-07", applied: 10, accepted: 13 },
//   { date: "2025-09-08", applied: 13, accepted: 12 },
//   { date: "2025-09-09", applied: 11, accepted: 10 },
//   { date: "2025-09-10", applied: 14, accepted: 12 },
//   { date: "2025-09-11", applied: 12, accepted: 14 },
//   { date: "2025-09-12", applied: 10, accepted: 11 },
//   { date: "2025-09-13", applied: 13, accepted: 15 },
//   { date: "2025-09-14", applied: 11, accepted: 13 },
//   { date: "2025-09-15", applied: 10, accepted: 12 },
//   { date: "2025-09-16", applied: 12, accepted: 11 },
//   { date: "2025-09-17", applied: 15, accepted: 13 },
//   { date: "2025-09-18", applied: 14, accepted: 15 },
//   { date: "2025-09-19", applied: 13, accepted: 12 },
//   { date: "2025-09-20", applied: 10, accepted: 11 },
//   { date: "2025-09-21", applied: 12, accepted: 14 },
//   { date: "2025-09-22", applied: 13, accepted: 10 },
//   { date: "2025-09-23", applied: 11, accepted: 12 },
//   { date: "2025-09-24", applied: 14, accepted: 13 },
//   { date: "2025-09-25", applied: 10, accepted: 15 },
//   { date: "2025-09-26", applied: 15, accepted: 13 },
//   { date: "2025-09-27", applied: 13, accepted: 11 },
//   { date: "2025-09-28", applied: 12, accepted: 10 },
//   { date: "2025-09-29", applied: 11, accepted: 13 },
//   { date: "2025-09-30", applied: 14, accepted: 12 },
//   { date: "2025-08-01", applied: 15, accepted: 14 },
//   { date: "2025-08-02", applied: 10, accepted: 13 },
//   { date: "2025-08-03", applied: 12, accepted: 11 },
//   { date: "2025-08-09", applied: 13, accepted: 15 },
//   { date: "2025-08-08", applied: 11, accepted: 10 },
//   { date: "2025-08-10", applied: 14, accepted: 13 },
//   { date: "2025-08-07", applied: 10, accepted: 12 },
//   { date: "2025-08-08", applied: 15, accepted: 11 },
//   { date: "2025-08-09", applied: 11, accepted: 13 },
//   { date: "2025-08-10", applied: 13, accepted: 14 },
//   { date: "2025-08-11", applied: 12, accepted: 10 },
//   { date: "2025-08-12", applied: 15, accepted: 13 },
//   { date: "2025-08-13", applied: 10, accepted: 12 },
//   { date: "2025-08-14", applied: 13, accepted: 15 },
//   { date: "2025-08-15", applied: 14, accepted: 11 },
//   { date: "2025-08-16", applied: 12, accepted: 13 },
//   { date: "2025-08-17", applied: 11, accepted: 14 },
//   { date: "2025-08-18", applied: 15, accepted: 10 },
//   { date: "2025-08-19", applied: 13, accepted: 11 },
//   { date: "2025-08-20", applied: 12, accepted: 13 },
//   { date: "2025-08-21", applied: 10, accepted: 12 },
//   { date: "2025-08-22", applied: 14, accepted: 15 },
//   { date: "2025-08-23", applied: 15, accepted: 14 },
//   { date: "2025-08-24", applied: 11, accepted: 10 },
//   { date: "2025-08-25", applied: 12, accepted: 13 },
//   { date: "2025-08-26", applied: 10, accepted: 11 },
//   { date: "2025-08-27", applied: 13, accepted: 15 },
//   { date: "2025-08-28", applied: 15, accepted: 13 },
//   { date: "2025-08-29", applied: 14, accepted: 12 },
//   { date: "2025-08-30", applied: 10, accepted: 11 },
//   { date: "2025-08-31", applied: 13, accepted: 12 },
//   { date: "2025-10-01", applied: 12, accepted: 14 },
//   { date: "2025-10-02", applied: 11, accepted: 15 },
//   { date: "2025-10-03", applied: 10, accepted: 13 },
//   { date: "2025-10-09", applied: 15, accepted: 11 },
//   { date: "2025-10-08", applied: 13, accepted: 10 },
//   { date: "2025-10-10", applied: 14, accepted: 12 },
//   { date: "2025-10-07", applied: 12, accepted: 15 },
//   { date: "2025-10-08", applied: 10, accepted: 11 },
//   { date: "2025-10-09", applied: 15, accepted: 13 },
//   { date: "2025-10-10", applied: 13, accepted: 14 },
//   { date: "2025-10-11", applied: 11, accepted: 10 },
//   { date: "2025-10-12", applied: 12, accepted: 15 },
//   { date: "2025-10-13", applied: 10, accepted: 11 },
//   { date: "2025-10-14", applied: 14, accepted: 12 },
//   { date: "2025-10-15", applied: 13, accepted: 15 },
//   { date: "2025-10-16", applied: 15, accepted: 14 },
//   { date: "2025-10-17", applied: 11, accepted: 10 },
//   { date: "2025-10-18", applied: 12, accepted: 13 },
//   { date: "2025-10-19", applied: 10, accepted: 12 },
//   { date: "2025-10-20", applied: 15, accepted: 14 },
//   { date: "2025-10-21", applied: 13, accepted: 11 },
//   { date: "2025-10-22", applied: 14, accepted: 12 },
//   { date: "2025-10-23", applied: 10, accepted: 13 },
//   { date: "2025-10-24", applied: 11, accepted: 15 },
//   { date: "2025-10-25", applied: 12, accepted: 14 },
//   { date: "2025-10-26", applied: 13, accepted: 10 },
//   { date: "2025-10-27", applied: 15, accepted: 13 },
//   { date: "2025-10-28", applied: 10, accepted: 12 },
//   { date: "2025-10-29", applied: 14, accepted: 11 },
//   { date: "2025-10-30", applied: 12, accepted: 15 },
// ];

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  applied: {
    label: "Applied",
    color: "var(--chart-1)",
  },
  accepted: {
    label: "Accepted",
    color: "var(--chart-2)",
  },
  rejected: {
    label: "Rejected",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

type ChartData = {
  date: string;
  applied: number;
  accepted: number;
  rejected: number;
};

export type ChartAreaInteractiveProps = {
  data: ChartData[];
  loading?: boolean;
};

export function ChartAreaInteractive({
  data,
  loading = true,
}: ChartAreaInteractiveProps) {
  const [timeRange, setTimeRange] = React.useState("90d");

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
    return <LoaderCircle className="animate-spin" />;
  }

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Applications - Interactive</CardTitle>
          <CardDescription>
            Showing total applications for the last 3 months
            <p className="text-sm">
              (Will add visitors and other data in the future)
            </p>
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillAccepted" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-accepted)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-accepted)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillApplied" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-applied)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-applied)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillRejected" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-rejected)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-rejected)"
                  stopOpacity={0.1}
                />
              </linearGradient>
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
            <Area
              dataKey="applied"
              type="natural"
              fill="url(#fillApplied)"
              stroke="var(--color-applied)"
              stackId="a"
            />
            <Area
              dataKey="accepted"
              type="natural"
              fill="url(#fillAccepted)"
              stroke="var(--color-accepted)"
              stackId="a"
            />
            <Area
              dataKey="rejected"
              type="natural"
              fill="url(#fillRejected)"
              stroke="var(--color-rejected)"
              stackId="a"
            />

            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
