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

const chartConfig = {
  viewed: {
    label: "Visitors",
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
  // rejected: {
  //   label: "Rejected",
  //   color: "var(--chart-3)",
  // },
} satisfies ChartConfig;

type ChartData = {
  date: string;
  applied: number;
  viewed: number;
  bookmarked: number;
  hidden: number;
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
              <linearGradient id="fillHidden" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-hidden)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-hidden)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillBookmarked" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-bookmarked)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-bookmarked)"
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

              <linearGradient id="fillViewed" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-viewed)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-viewed)"
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
              dataKey="viewed"
              type="natural"
              fill="url(#fillViewed)"
              stroke="var(--color-viewed)"
              stackId="a"
            />
            <Area
              dataKey="bookmarked"
              type="natural"
              fill="url(#fillBookmarked)"
              stroke="var(--color-bookmarked)"
              stackId="a"
            />
            <Area
              dataKey="hidden"
              type="natural"
              fill="url(#fillHidden)"
              stroke="var(--color-hidden)"
              stackId="a"
            />
            {/* <Area
              dataKey="rejected"
              type="natural"
              fill="url(#fillRejected)"
              stroke="var(--color-rejected)"
              stackId="a"
            /> */}

            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
