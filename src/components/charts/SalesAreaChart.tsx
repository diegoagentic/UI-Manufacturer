import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DashMetricsPeriod } from '../DashboardMetricsGrid';

const dataByPeriod: Record<DashMetricsPeriod, { name: string; revenue: number }[]> = {
    Day: [
        { name: "8 AM", revenue: 820 },
        { name: "10 AM", revenue: 1450 },
        { name: "12 PM", revenue: 2100 },
        { name: "2 PM", revenue: 1780 },
        { name: "4 PM", revenue: 2350 },
        { name: "6 PM", revenue: 1200 },
    ],
    Week: [
        { name: "Mon", revenue: 5200 },
        { name: "Tue", revenue: 4800 },
        { name: "Wed", revenue: 6100 },
        { name: "Thu", revenue: 5700 },
        { name: "Fri", revenue: 7200 },
    ],
    Month: [
        { name: "Jan", revenue: 4000 },
        { name: "Feb", revenue: 3000 },
        { name: "Mar", revenue: 2000 },
        { name: "Apr", revenue: 2780 },
        { name: "May", revenue: 1890 },
        { name: "Jun", revenue: 2390 },
        { name: "Jul", revenue: 3490 },
    ],
    Quarter: [
        { name: "Q1", revenue: 9000 },
        { name: "Q2", revenue: 7070 },
        { name: "Q3", revenue: 8200 },
        { name: "Q4", revenue: 10500 },
    ],
};

const subtitles: Record<DashMetricsPeriod, string> = {
    Day: 'Hourly revenue today',
    Week: 'Daily revenue this week',
    Month: 'Revenue trends over the last 7 months',
    Quarter: 'Quarterly revenue performance',
};

export function SalesAreaChart({ period = 'Month' }: { period?: DashMetricsPeriod }) {
    const data = dataByPeriod[period];

    return (
        <div className="h-[400px] w-full bg-card rounded-xl p-4 border border-border shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">Sales Performance</h3>
                    <p className="text-sm text-muted-foreground">{subtitles[period]}</p>
                </div>
            </div>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--chart-brand-fill)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="var(--chart-brand-fill)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-zinc-800" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(24, 24, 27, 0.9)',
                                borderRadius: '8px',
                                border: '1px solid #27272a',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                color: '#F4F4F5'
                            }}
                            itemStyle={{ color: 'bg-brand-400' }}
                            formatter={(value) => [`$${value}`, 'Revenue']}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="var(--chart-brand-fill)"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                            activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--color-brand-300)' }}
                            animationDuration={600}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
