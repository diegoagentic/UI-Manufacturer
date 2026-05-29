import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DashMetricsPeriod } from '../DashboardMetricsGrid';

const dataByPeriod: Record<DashMetricsPeriod, { name: string; available: number; reserved: number; backordered: number }[]> = {
    Day: [
        { name: "Seating", available: 85, reserved: 42, backordered: 15 },
        { name: "Desks", available: 62, reserved: 28, backordered: 8 },
        { name: "Storage", available: 45, reserved: 180, backordered: 35 },
        { name: "Tables", available: 58, reserved: 72, backordered: 12 },
        { name: "Access.", available: 38, reserved: 90, backordered: 4 },
    ],
    Week: [
        { name: "Seating", available: 250, reserved: 140, backordered: 55 },
        { name: "Desks", available: 180, reserved: 82, backordered: 28 },
        { name: "Storage", available: 120, reserved: 580, backordered: 120 },
        { name: "Tables", available: 165, reserved: 230, backordered: 45 },
        { name: "Access.", available: 110, reserved: 290, backordered: 12 },
    ],
    Month: [
        { name: "Seating", available: 400, reserved: 240, backordered: 100 },
        { name: "Desks", available: 300, reserved: 139, backordered: 50 },
        { name: "Storage", available: 200, reserved: 980, backordered: 200 },
        { name: "Tables", available: 278, reserved: 390, backordered: 80 },
        { name: "Access.", available: 189, reserved: 480, backordered: 20 },
    ],
    Quarter: [
        { name: "Seating", available: 1350, reserved: 820, backordered: 340 },
        { name: "Desks", available: 1020, reserved: 475, backordered: 170 },
        { name: "Storage", available: 680, reserved: 3340, backordered: 680 },
        { name: "Tables", available: 945, reserved: 1330, backordered: 270 },
        { name: "Access.", available: 640, reserved: 1635, backordered: 68 },
    ],
};

export function InventoryHealthChart({ period = 'Month' }: { period?: DashMetricsPeriod }) {
    const data = dataByPeriod[period];

    return (
        <div className="h-[300px] w-full bg-card rounded-xl p-4 border border-border shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">Inventory Health</h3>
                    <p className="text-sm text-muted-foreground">Stock availability by Category</p>
                </div>
            </div>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-zinc-800" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                            itemStyle={{ color: '#1F2937' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        <Bar dataKey="available" stackId="a" fill="#10b981" name="Available" radius={[0, 0, 4, 4]} animationDuration={600} />
                        <Bar dataKey="reserved" stackId="a" fill="#f59e0b" name="Reserved" animationDuration={600} />
                        <Bar dataKey="backordered" stackId="a" fill="#ef4444" name="Backordered" radius={[4, 4, 0, 0]} animationDuration={600} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
