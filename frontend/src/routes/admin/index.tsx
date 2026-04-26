import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Activity, BookOpen, Disc3, Mic, Music2, Users } from 'lucide-react';
import { useEffect } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdminDashboardQuery } from '../../hooks/admin-dashboard';
import { useAdminAuthStore } from '../../store/adminAuthStore';

export const Route = createFileRoute('/admin/')({ component: AdminIndex });

const chartSeries = [
  { key: 'tracks', label: 'Tracks', color: '#3dc9b0' },
  { key: 'albums', label: 'Albums', color: '#68a8ff' },
  { key: 'podcasts', label: 'Podcasts', color: '#f59e0b' },
  { key: 'audiobooks', label: 'Audiobooks', color: '#f07282' },
] as const;

type ChartSeriesKey = (typeof chartSeries)[number]['key'];
type ContentChartPoint = { month: string } & Record<ChartSeriesKey, number>;
type ContentChartDisplayPoint = ContentChartPoint & Record<`${ChartSeriesKey}Display`, number>;

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

function DashboardSkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-[#2a3a52] bg-[#1e2638] p-5 animate-pulse">
            <div className="h-3 w-24 rounded bg-white/10 mb-4" />
            <div className="h-8 w-20 rounded bg-white/10 mb-3" />
            <div className="h-3 w-32 rounded bg-white/10" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-[#2a3a52] bg-[#1e2638] p-5 animate-pulse">
        <div className="h-4 w-40 rounded bg-white/10 mb-2" />
        <div className="h-3 w-64 rounded bg-white/10 mb-6" />
        <div className="h-[320px] rounded-xl bg-white/5" />
      </div>
    </>
  );
}

function ContentChart({
  data,
}: {
  data: ContentChartPoint[];
}) {
  const maxValue = Math.max(0, ...data.flatMap((point) => [point.tracks, point.albums, point.podcasts, point.audiobooks]));
  const overlapOffset = Math.max(maxValue * 0.06, 0.12);
  const chartData: ContentChartDisplayPoint[] = data.map((point) => {
    const displayPoint = { ...point } as ContentChartDisplayPoint;
    const valueGroups = new Map<number, ChartSeriesKey[]>();

    chartSeries.forEach(({ key }) => {
      const value = point[key];
      valueGroups.set(value, [...(valueGroups.get(value) ?? []), key]);
    });

    valueGroups.forEach((keys, value) => {
      keys.forEach((key, index) => {
        const offset = value > 0 && keys.length > 1 ? (index - (keys.length - 1) / 2) * overlapOffset : 0;
        displayPoint[`${key}Display`] = Math.max(0, value + offset);
      });
    });

    return displayPoint;
  });

  return (
    <div className="rounded-2xl border border-[#2a3a52] bg-[#1e2638] p-5">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-white text-lg font-semibold">Content Created</h2>
          <p className="text-[#7a8faa] text-sm">New tracks, albums, podcasts, and audiobooks over the last 12 months</p>
        </div>
      </div>

      <div className="relative h-[340px] rounded-xl bg-[#151d2e] border border-[#253050] px-2 py-4">
        {maxValue === 0 ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center text-sm text-[#7a8faa]">
            No data yet for the last 12 months
          </div>
        ) : null}

        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 12, right: 20, left: 0, bottom: 4 }}>
            <defs>
              {chartSeries.map((series) => (
                <linearGradient key={series.key} id={`stroke-${series.key}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={series.color} stopOpacity={0.65} />
                  <stop offset="100%" stopColor={series.color} stopOpacity={1} />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid stroke="#27364d" strokeDasharray="4 6" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#7084a2', fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              width={36}
              allowDecimals={false}
              domain={[0, Math.ceil(maxValue + overlapOffset)]}
              tick={{ fill: '#7084a2', fontSize: 11 }}
            />
            <Tooltip
              cursor={{ stroke: '#35506b', strokeWidth: 1, strokeDasharray: '4 6' }}
              contentStyle={{
                backgroundColor: 'rgba(17, 25, 41, 0.96)',
                border: '1px solid #35506b',
                borderRadius: '14px',
                boxShadow: '0 20px 45px rgba(0, 0, 0, 0.35)',
              }}
              labelStyle={{
                color: '#d9e5f3',
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 6,
              }}
              itemStyle={{ color: '#b9c8da', fontSize: 12, padding: 0 }}
              formatter={(_value, name, item) => {
                const series = chartSeries.find((entry) => entry.label === name);

                if (!series) return [_value, name];

                return [item.payload[series.key], name];
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              height={40}
              wrapperStyle={{ fontSize: '12px', color: '#b9c8da', paddingBottom: '8px' }}
            />

            {chartSeries.map((series) => (
              <Line
                key={series.key}
                type="monotone"
                dataKey={`${series.key}Display`}
                name={series.label}
                stroke={`url(#stroke-${series.key})`}
                strokeWidth={3}
                strokeLinecap="round"
                dot={{ r: 3.5, strokeWidth: 2, fill: series.color, stroke: '#151d2e' }}
                activeDot={{ r: 5, fill: series.color, stroke: '#dbe7f3', strokeWidth: 2 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function AdminIndex() {
  const navigate = useNavigate();
  const isAuthenticated = useAdminAuthStore((s) => s.isAuthenticated);
  const isBootstrapped = useAdminAuthStore((s) => s.isBootstrapped);
  const dashboardQuery = useAdminDashboardQuery();

  useEffect(() => {
    if (!isBootstrapped) {
      return;
    }

    if (!isAuthenticated) {
      navigate({ to: '/admin/login' });
    }
  }, [isAuthenticated, isBootstrapped, navigate]);

  if (!isBootstrapped || !isAuthenticated) return null;

  const dashboard = dashboardQuery.data;
  const totals = dashboard?.totals;
  const totalContent =
    (totals?.tracks ?? 0) + (totals?.albums ?? 0) + (totals?.podcasts ?? 0) + (totals?.audiobooks ?? 0);

  const cards = [
    {
      label: 'Total Users',
      value: totals?.users ?? 0,
      description: `${totals?.creators ?? 0} creators included`,
      icon: Users,
      color: 'text-[#3dc9b0]',
    },
    {
      label: 'Total Creators',
      value: totals?.creators ?? 0,
      description: 'Accounts publishing content',
      icon: Activity,
      color: 'text-[#65a7ff]',
    },
    {
      label: 'Tracks',
      value: totals?.tracks ?? 0,
      description: 'Songs in the catalog',
      icon: Music2,
      color: 'text-[#3dc9b0]',
    },
    {
      label: 'Albums',
      value: totals?.albums ?? 0,
      description: 'Released album entries',
      icon: Disc3,
      color: 'text-[#68a8ff]',
    },
    {
      label: 'Podcasts',
      value: totals?.podcasts ?? 0,
      description: 'Podcast series available',
      icon: Mic,
      color: 'text-[#f59e0b]',
    },
    {
      label: 'Audiobooks',
      value: totals?.audiobooks ?? 0,
      description: 'Audiobook series available',
      icon: BookOpen,
      color: 'text-[#f07282]',
    },
  ];

  return (
    <AdminLayout>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-white text-2xl font-semibold">Dashboard</h1>
          <p className="text-[#7a8faa] text-sm mt-1">A live overview of users and catalog growth across the platform</p>
        </div>
        <div className="rounded-2xl border border-[#2a3a52] bg-[#1e2638] px-4 py-3 min-w-[180px]">
          <p className="text-xs uppercase tracking-wide text-[#7a8faa] font-semibold mb-1">Total Content</p>
          <p className="text-2xl font-semibold text-white">{formatCompactNumber(totalContent)}</p>
        </div>
      </div>

      {dashboardQuery.isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {dashboardQuery.error instanceof Error && (
            <div className="mb-5 rounded-xl border border-[#5a3240] bg-[#2a1e29] px-4 py-3 text-sm text-red-200">
              {dashboardQuery.error.message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="rounded-2xl border border-[#2a3a52] bg-[#1e2638] p-5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#7a8faa]">{card.label}</p>
                    <Icon size={18} className={card.color} />
                  </div>
                  <p className="text-3xl font-semibold text-white mb-2">{formatCompactNumber(card.value)}</p>
                  <p className="text-sm text-[#7a8faa]">{card.description}</p>
                </div>
              );
            })}
          </div>

          <ContentChart data={dashboard?.monthlyContent ?? []} />
        </>
      )}
    </AdminLayout>
  );
}
