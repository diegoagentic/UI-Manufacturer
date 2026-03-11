import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DashMetricsPeriod } from '../DashboardMetricsGrid';

const dataByPeriod: Record<DashMetricsPeriod, { name: string; revenue: number; margin: number }[]> = {
    Day: [
        { name: "8 AM", revenue: 120, margin: 72 },
        { name: "10 AM", revenue: 280, margin: 85 },
        { name: "12 PM", revenue: 350, margin: 78 },
        { name: "2 PM", revenue: 310, margin: 82 },
        { name: "4 PM", revenue: 420, margin: 90 },
        { name: "6 PM", revenue: 180, margin: 65 },
    ],
    Week: [
        { name: "Mon", revenue: 820, margin: 78 },
        { name: "Tue", revenue: 950, margin: 82 },
        { name: "Wed", revenue: 1100, margin: 85 },
        { name: "Thu", revenue: 980, margin: 80 },
        { name: "Fri", revenue: 1250, margin: 88 },
    ],
    Month: [
        { name: "Week 1", revenue: 590, margin: 80 },
        { name: "Week 2", revenue: 868, margin: 96 },
        { name: "Week 3", revenue: 1397, margin: 109 },
        { name: "Week 4", revenue: 1480, margin: 120 },
        { name: "Week 5", revenue: 1520, margin: 110 },
        { name: "Week 6", revenue: 1400, margin: 68 },
    ],
    Quarter: [
        { name: "Jan", revenue: 2855, margin: 95 },
        { name: "Feb", revenue: 3200, margin: 102 },
        { name: "Mar", revenue: 3680, margin: 88 },
        { name: "Apr", revenue: 4100, margin: 110 },
        { name: "May", revenue: 3900, margin: 98 },
        { name: "Jun", revenue: 4500, margin: 115 },
    ],
};

export function MarginTrendChart({ period = 'Month' }: { period?: DashMetricsPeriod }) {
    const data = dataByPeriod[period];

    return (
        <div className="h-[300px] w-full bg-white dark:bg-zinc-800 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Margin Trends</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Revenue vs Profit Margin (%)</p>
                </div>
            </div>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={data}
                        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" className="dark:stroke-zinc-800" />
                        <XAxis dataKey="name" scale="band" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="left" orientation="left" stroke="#6366f1" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="revenue" barSize={20} fill="#6366f1" radius={[4, 4, 0, 0]} animationDuration={600} />
                        <Line yAxisId="right" type="monotone" dataKey="margin" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} animationDuration={600} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
