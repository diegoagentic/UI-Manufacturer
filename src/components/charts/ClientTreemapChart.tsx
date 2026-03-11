import { ResponsiveContainer, Tooltip, Treemap } from "recharts";
import type { DashMetricsPeriod } from '../DashboardMetricsGrid';

const dataByPeriod: Record<DashMetricsPeriod, { name: string; size: number; fill: string }[]> = {
    Day: [
        { name: "TechDealer", size: 650, fill: "#6366f1" },
        { name: "Global Logistics", size: 480, fill: "#8b5cf6" },
        { name: "Urban Living", size: 320, fill: "#d946ef" },
        { name: "AutoManufacture", size: 410, fill: "#0ea5e9" },
        { name: "Retail Corp", size: 280, fill: "#10b981" },
        { name: "Startup Inc", size: 350, fill: "#f59e0b" },
    ],
    Week: [
        { name: "TechDealer", size: 2100, fill: "#6366f1" },
        { name: "Global Logistics", size: 1600, fill: "#8b5cf6" },
        { name: "Urban Living", size: 1050, fill: "#d946ef" },
        { name: "AutoManufacture", size: 1400, fill: "#0ea5e9" },
        { name: "Retail Corp", size: 950, fill: "#10b981" },
        { name: "Startup Inc", size: 1200, fill: "#f59e0b" },
    ],
    Month: [
        { name: "TechDealer", size: 4000, fill: "#6366f1" },
        { name: "Global Logistics", size: 3000, fill: "#8b5cf6" },
        { name: "Urban Living", size: 2000, fill: "#d946ef" },
        { name: "AutoManufacture", size: 2780, fill: "#0ea5e9" },
        { name: "Retail Corp", size: 1890, fill: "#10b981" },
        { name: "Startup Inc", size: 2390, fill: "#f59e0b" },
    ],
    Quarter: [
        { name: "TechDealer", size: 12800, fill: "#6366f1" },
        { name: "Global Logistics", size: 9500, fill: "#8b5cf6" },
        { name: "Urban Living", size: 6400, fill: "#d946ef" },
        { name: "AutoManufacture", size: 8900, fill: "#0ea5e9" },
        { name: "Retail Corp", size: 6100, fill: "#10b981" },
        { name: "Startup Inc", size: 7600, fill: "#f59e0b" },
    ],
};

const CustomizeContent = (props: any) => {
    const { depth, x, y, width, height, payload, name } = props;

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: (payload && payload.fill) || '#8884d8',
                    stroke: '#fff',
                    strokeWidth: 2 / (depth + 1e-10),
                    strokeOpacity: 1 / (depth + 1e-10),
                }}
            />
            {
                width > 50 && height > 50 ? (
                    <text
                        x={x + width / 2}
                        y={y + height / 2}
                        textAnchor="middle"
                        fill="#fff"
                        fontSize={14}
                    >
                        {name}
                    </text>
                ) : null
            }
        </g>
    );
};

export function ClientTreemapChart({ period = 'Month' }: { period?: DashMetricsPeriod }) {
    const data = dataByPeriod[period];

    return (
        <div className="h-[300px] w-full bg-white dark:bg-zinc-800 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Client Value</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Revenue concentration</p>
                </div>
            </div>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <Treemap
                        data={data}
                        dataKey="size"
                        aspectRatio={4 / 3}
                        stroke="#fff"
                        fill="#8884d8"
                        content={<CustomizeContent />}
                        animationDuration={600}
                    >
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                        />
                    </Treemap>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
