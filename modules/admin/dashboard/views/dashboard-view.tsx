'use client';

import { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  XAxis,
  YAxis,
} from 'recharts';
import { toast } from 'sonner';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { fetchDashboardStats } from '@/lib/apis/dashboard';
import { ADMIN_DASHBOARD_STATS_KEY } from '@/lib/constants/query-key';
import ErrorCard from '@/modules/admin/common/components/error-card';
import { useHeader } from '@/modules/admin/common/stores/header';
import { FileText, MessageCircle, Users } from 'lucide-react';

const chartConfig = {
  cumulativeUsers: {
    label: 'Total users',
    color: 'var(--chart-1)',
  },
  newUsers: {
    label: 'New sign-ups',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

function formatUtcChartDay(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

function formatTickLabel(dateStr: string): string {
  try {
    return format(formatUtcChartDay(dateStr), 'MMM d');
  } catch {
    return dateStr;
  }
}

function DashboardSkeleton() {
  return (
    <div className='min-w-0 max-w-full space-y-6 px-6'>
      <div className='grid gap-4 sm:grid-cols-3'>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className='overflow-hidden'>
            <CardHeader className='space-y-2'>
              <div className='h-4 w-24 animate-pulse rounded bg-muted' />
              <div className='h-8 w-16 animate-pulse rounded bg-muted' />
            </CardHeader>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <div className='h-5 w-48 animate-pulse rounded bg-muted' />
          <div className='h-4 w-full max-w-md animate-pulse rounded bg-muted' />
        </CardHeader>
        <CardContent>
          <div className='aspect-video w-full animate-pulse rounded-lg bg-muted/60' />
        </CardContent>
      </Card>
    </div>
  );
}

const DashboardView = () => {
  const setTitle = useHeader((state) => state.setTitle);

  useEffect(() => {
    setTitle('Dashboard');
  }, [setTitle]);

  const { data, isPending, isError, error } = useQuery({
    queryKey: [ADMIN_DASHBOARD_STATS_KEY],
    queryFn: fetchDashboardStats,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (isError) {
      const message =
        error instanceof Error ? error.message : 'Failed to load dashboard';
      toast.error(message);
    }
  }, [isError, error]);

  const chartData = data?.userGrowth ?? [];

  if (isPending && !data) {
    return <DashboardSkeleton />;
  }

  if (isError || !data) {
    const title = 'Could not load dashboard';
    const message =
      error instanceof Error ? error.message : 'Fetch dashboard stats failed';

    return (
      <div className='min-w-0 max-w-full px-6'>
        <ErrorCard title={title} message={message} />
      </div>
    );
  }

  return (
    <div className='min-w-0 max-w-full space-y-6 px-6'>
      <div className='grid gap-4 sm:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Total users
            </CardTitle>
            <Users className='size-4 text-muted-foreground' aria-hidden />
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-semibold tabular-nums tracking-tight'>
              {data.totalUsers.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Total blogs
            </CardTitle>
            <FileText className='size-4 text-muted-foreground' aria-hidden />
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-semibold tabular-nums tracking-tight'>
              {data.totalBlogs.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Total comments
            </CardTitle>
            <MessageCircle
              className='size-4 text-muted-foreground'
              aria-hidden
            />
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-semibold tabular-nums tracking-tight'>
              {data.totalComments.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User growth</CardTitle>
          <CardDescription>
            Cumulative users over time (UTC days). Bars show new registrations
            per day.
          </CardDescription>
        </CardHeader>
        <CardContent className='pl-2 sm:pl-4'>
          {chartData.length === 0 ? (
            <p className='text-sm text-muted-foreground'>
              No user growth data yet. KPIs above still reflect current totals.
            </p>
          ) : (
            <ChartContainer config={chartConfig} className='aspect-auto h-[320px] w-full'>
              <ComposedChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey='date'
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={24}
                  tickFormatter={formatTickLabel}
                />
                <YAxis
                  yAxisId='left'
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={48}
                  allowDecimals={false}
                />
                <YAxis
                  yAxisId='right'
                  orientation='right'
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={40}
                  allowDecimals={false}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(_value, payload) => {
                        const row = payload?.[0]?.payload as
                          | { date?: string }
                          | undefined;
                        const d = row?.date;
                        if (!d) return '';
                        try {
                          return format(formatUtcChartDay(d), 'MMM d, yyyy');
                        } catch {
                          return d;
                        }
                      }}
                    />
                  }
                />
                <Area
                  yAxisId='left'
                  dataKey='cumulativeUsers'
                  type='monotone'
                  fill='var(--color-cumulativeUsers)'
                  fillOpacity={0.35}
                  stroke='var(--color-cumulativeUsers)'
                  strokeWidth={2}
                />
                <Bar
                  yAxisId='right'
                  dataKey='newUsers'
                  fill='var(--color-newUsers)'
                  radius={[4, 4, 0, 0]}
                />
              </ComposedChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardView;
