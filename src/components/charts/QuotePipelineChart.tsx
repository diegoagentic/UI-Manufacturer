import { Legend, RadialBar, RadialBarChart, ResponsiveContainer, Tooltip } from "recharts";
import type { DashMetricsPeriod } from '../DashboardMetricsGrid';

const dataByPeriod: Record<DashMetricsPeriod, { name: string; uv: number; fill: string }[]> = {
    Day: [
        { name: "Draft", uv: 8.5, fill: "#94a3b8" },
        { name: "Sent", uv: 5.2, fill: "#3b82f6" },
        { name: "Negotiating", uv: 3.1, fill: "#eab308" },
        { name: "Approved", uv: 2.0, fill: "#22c55e" },
        { name: "Rejected", uv: 0.8, fill: "#ef4444" },
    ],
    Week: [
        { name: "Draft", uv: 18.3, fill: "#94a3b8" },
        { name: "Sent", uv: 14.7, fill: "#3b82f6" },
        { name: "Negotiating", uv: 9.2, fill: "#eab308" },
        { name: "Approved", uv: 5.5, fill: "#22c55e" },
        { name: "Rejected", uv: 2.8, fill: "#ef4444" },
    ],
    Month: [
        { name: "Draft", uv: 31.47, fill: "#94a3b8" },
        { name: "Sent", uv: 26.69, fill: "#3b82f6" },
        { name: "Negotiating", uv: 15.69, fill: "#eab308" },
        { name: "Approved", uv: 8.22, fill: "#22c55e" },
        { name: "Rejected", uv: 4.63, fill: "#ef4444" },
    ],
    Quarter: [
        { name: "Draft", uv: 42.1, fill: "#94a3b8" },
        { name: "Sent", uv: 35.8, fill: "#3b82f6" },
        { name: "Negotiating", uv: 22.4, fill: "#eab308" },
        { name: "Approved", uv: 15.6, fill: "#22c55e" },
        { name: "Rejected", uv: 8.9, fill: "#ef4444" },
    ],
};

export function QuotePipelineChart({ period = 'Month' }: { period?: DashMetricsPeriod }) {
    const data = dataByPeriod[period];

    return (
        <div className="h-[300px] w-full bg-card rounded-xl p-4 border border-border shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">Quote Pipeline</h3>
                    <p className="text-sm text-muted-foreground">Status distribution</p>
                </div>
            </div>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                        cx="50%"
                        cy="50%"
                        innerRadius="10%"
                        outerRadius="90%"
                        barSize={15}
                        data={data}
                        startAngle={180}
                        endAngle={0}
                    >
                        <RadialBar
                            label={{ position: 'insideStart', fill: '#fff', fontSize: '10px' }}
                            background
                            dataKey="uv"
                        />
                        <Legend
                            iconSize={10}
                            layout="vertical"
                            verticalAlign="middle"
                            wrapperStyle={{ right: 0 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                        />
                    </RadialBarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
